package utils

import (
	"errors"
	"fmt"
	"net"
	"regexp"
	"strings"
	"unicode"
)

// 验证错误定义
var (
	ErrInvalidIP         = errors.New("无效的IP地址格式")
	ErrInvalidPort       = errors.New("端口号必须在1-65535之间")
	ErrPasswordTooShort  = errors.New("密码长度至少为8个字符")
	ErrPasswordTooLong   = errors.New("密码长度不能超过128个字符")
	ErrPasswordNoUpper   = errors.New("密码必须包含至少一个大写字母")
	ErrPasswordNoLower   = errors.New("密码必须包含至少一个小写字母")
	ErrPasswordNoDigit   = errors.New("密码必须包含至少一个数字")
	ErrPasswordNoSpecial = errors.New("密码必须包含至少一个特殊字符")
	ErrPasswordCommon    = errors.New("密码过于简单，请使用更复杂的密码")
	ErrInvalidUsername   = errors.New("用户名格式无效")
	ErrInvalidHostname   = errors.New("主机名格式无效")
)

// 常见弱密码列表
var commonPasswords = map[string]bool{
	"password":    true,
	"12345678":    true,
	"qwerty":      true,
	"abc123":      true,
	"password1":   true,
	"password123": true,
	"admin":       true,
	"admin123":    true,
	"letmein":     true,
	"welcome":     true,
	"monkey":      true,
	"dragon":      true,
	"master":      true,
	"login":       true,
	"passw0rd":    true,
	"hello":       true,
	"shadow":      true,
	"sunshine":    true,
	"princess":    true,
	"football":    true,
	"iloveyou":    true,
}

// ValidateIPAddress 验证IP地址格式
func ValidateIPAddress(ip string) error {
	if ip == "" {
		return errors.New("IP地址不能为空")
	}

	// 尝试解析为IPv4或IPv6
	if net.ParseIP(ip) == nil {
		return ErrInvalidIP
	}

	return nil
}

// ValidateIPAddressOrHost 验证IP地址或域名/主机名格式
func ValidateIPAddressOrHost(ip string) error {
	if ip == "" {
		return errors.New("IP地址不能为空")
	}
	if net.ParseIP(ip) != nil {
		return nil
	}
	return ValidateHostname(ip)
}

// ValidatePort 验证端口号
func ValidatePort(port int) error {
	if port < 1 || port > 65535 {
		return ErrInvalidPort
	}
	return nil
}

// ValidatePortString 验证端口字符串
func ValidatePortString(portStr string) error {
	if portStr == "" {
		return errors.New("端口号不能为空")
	}

	port := 0
	for _, c := range portStr {
		if c < '0' || c > '9' {
			return errors.New("端口号必须为数字")
		}
		port = port*10 + int(c-'0')
	}

	return ValidatePort(port)
}

// PasswordPolicy 密码策略配置
type PasswordPolicy struct {
	MinLength      int  // 最小长度
	MaxLength      int  // 最大长度
	RequireUpper   bool // 需要大写字母
	RequireLower   bool // 需要小写字母
	RequireDigit   bool // 需要数字
	RequireSpecial bool // 需要特殊字符
	CheckCommon    bool // 检查常见弱密码
}

// DefaultPasswordPolicy 默认密码策略
var DefaultPasswordPolicy = PasswordPolicy{
	MinLength:      8,
	MaxLength:      128,
	RequireUpper:   true,
	RequireLower:   true,
	RequireDigit:   true,
	RequireSpecial: false, // 默认不强制要求特殊字符
	CheckCommon:    true,
}

// ValidatePassword 验证密码复杂度
func ValidatePassword(password string) error {
	return ValidatePasswordWithPolicy(password, DefaultPasswordPolicy)
}

// ValidatePasswordWithPolicy 使用指定策略验证密码
func ValidatePasswordWithPolicy(password string, policy PasswordPolicy) error {
	if len(password) < policy.MinLength {
		return ErrPasswordTooShort
	}

	if len(password) > policy.MaxLength {
		return ErrPasswordTooLong
	}

	hasUpper := false
	hasLower := false
	hasDigit := false
	hasSpecial := false

	for _, c := range password {
		switch {
		case unicode.IsUpper(c):
			hasUpper = true
		case unicode.IsLower(c):
			hasLower = true
		case unicode.IsDigit(c):
			hasDigit = true
		case unicode.IsPunct(c) || unicode.IsSymbol(c):
			hasSpecial = true
		}
	}

	if policy.RequireUpper && !hasUpper {
		return ErrPasswordNoUpper
	}

	if policy.RequireLower && !hasLower {
		return ErrPasswordNoLower
	}

	if policy.RequireDigit && !hasDigit {
		return ErrPasswordNoDigit
	}

	if policy.RequireSpecial && !hasSpecial {
		return ErrPasswordNoSpecial
	}

	// 检查常见弱密码
	if policy.CheckCommon {
		lowerPassword := strings.ToLower(password)
		if commonPasswords[lowerPassword] {
			return ErrPasswordCommon
		}

		// 检查是否为连续字符或重复字符
		if isSequentialOrRepeating(password) {
			return ErrPasswordCommon
		}
	}

	return nil
}

// isSequentialOrRepeating 检查密码是否为连续字符或重复字符
func isSequentialOrRepeating(password string) bool {
	if len(password) < 4 {
		return false
	}

	lower := strings.ToLower(password)
	sequential := 1
	repeating := 1

	for i := 1; i < len(lower); i++ {
		// 检查连续字符 (如 "abcd", "1234")
		if lower[i] == lower[i-1]+1 {
			sequential++
			if sequential >= 4 {
				return true
			}
		} else {
			sequential = 1
		}

		// 检查重复字符 (如 "aaaa", "1111")
		if lower[i] == lower[i-1] {
			repeating++
			if repeating >= 4 {
				return true
			}
		} else {
			repeating = 1
		}
	}

	return false
}

// ValidateUsername 验证用户名格式
func ValidateUsername(username string) error {
	if username == "" {
		return errors.New("用户名不能为空")
	}

	if len(username) < 3 {
		return errors.New("用户名长度至少为3个字符")
	}

	if len(username) > 64 {
		return errors.New("用户名长度不能超过64个字符")
	}

	// 用户名只能包含字母、数字、下划线和横线
	matched, _ := regexp.MatchString("^[a-zA-Z0-9_-]+$", username)
	if !matched {
		return ErrInvalidUsername
	}

	return nil
}

// ValidateHostname 验证主机名格式
func ValidateHostname(hostname string) error {
	if hostname == "" {
		return errors.New("主机名不能为空")
	}

	if len(hostname) > 253 {
		return errors.New("主机名长度不能超过253个字符")
	}

	// 检查主机名格式
	matched, _ := regexp.MatchString(`^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$`, hostname)
	if !matched {
		return ErrInvalidHostname
	}

	return nil
}

// ValidateAssetInput 验证资产输入
func ValidateAssetInput(ip string, port int, protocol string) error {
	// 验证IP地址（资产地址也允许使用域名/主机名）
	if net.ParseIP(ip) == nil {
		if err := ValidateHostname(ip); err != nil {
			return fmt.Errorf("IP地址或主机名验证失败: %w", err)
		}
	}

	// 验证端口
	if err := ValidatePort(port); err != nil {
		return fmt.Errorf("端口验证失败: %w", err)
	}

	// 验证协议
	validProtocols := map[string]bool{
		"ssh":        true,
		"rdp":        true,
		"vnc":        true,
		"telnet":     true,
		"kubernetes": true,
	}

	if !validProtocols[strings.ToLower(protocol)] {
		return fmt.Errorf("不支持的协议: %s", protocol)
	}

	return nil
}

// SanitizeInput 清理输入字符串，移除危险字符
func SanitizeInput(input string, maxLength int) string {
	// 截断到最大长度
	if len(input) > maxLength {
		input = input[:maxLength]
	}

	// 移除控制字符
	var result strings.Builder
	for _, c := range input {
		if !unicode.IsControl(c) || c == '\n' || c == '\t' {
			result.WriteRune(c)
		}
	}

	return result.String()
}
