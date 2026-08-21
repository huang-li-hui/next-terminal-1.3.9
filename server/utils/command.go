package utils

import (
	"bytes"
	"os/exec"
	"regexp"
	"strings"
)

// 危险命令黑名单
// 注意：这里只拦截明确破坏性的命令模式，避免子串误伤正常的
// 下载（wget/curl）、改属主（chown -R 指定目录）、清理临时目录
// （rm -rf /tmp/xxx）等合法操作
var dangerousCommands = []string{
	"mkfs",
	"dd if=",
	":(){ :|:& };:", // fork bomb
	"> /dev/sda",
	"chmod -r 777 /",
	"shutdown",
	"reboot",
	"init 0",
	"init 6",
}

// rmRecursiveRootRegex 匹配对根目录的递归删除，如 "rm -rf /"、"rm -fr / var"，
// 但不会匹配 "rm -rf /tmp/foo" 这类针对具体子目录的清理
var rmRecursiveRootRegex = regexp.MustCompile(`rm\s+(-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r)[a-z]*\s+(/(\s|$)|/\*)`)

// Exec 执行shell命令
// 注意：此函数用于执行用户定义的shell命令，需要进行安全检查
func Exec(command string) (string, string, error) {
	// 安全检查：检测危险命令
	if err := validateCommand(command); err != nil {
		return "", "", err
	}

	var stdout bytes.Buffer
	var stderr bytes.Buffer

	cmd := exec.Command("bash", "-c", command)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}

// validateCommand 验证命令是否安全
func validateCommand(command string) error {
	lowerCommand := strings.ToLower(command)

	// 检查危险命令
	for _, dangerous := range dangerousCommands {
		if strings.Contains(lowerCommand, strings.ToLower(dangerous)) {
			return &DangerousCommandError{Command: command}
		}
	}

	// 检查针对根目录的递归删除
	if rmRecursiveRootRegex.MatchString(lowerCommand) {
		return &DangerousCommandError{Command: command}
	}

	return nil
}

// DangerousCommandError 危险命令错误
type DangerousCommandError struct {
	Command string
}

func (e *DangerousCommandError) Error() string {
	return "命令包含危险操作，已被阻止执行"
}

// IsDangerousCommand 检查命令是否被阻止
func IsDangerousCommand(err error) bool {
	_, ok := err.(*DangerousCommandError)
	return ok
}
