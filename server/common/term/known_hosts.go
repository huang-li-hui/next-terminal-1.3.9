package term

import (
	"encoding/base64"
	"errors"
	"fmt"
	"io/ioutil"
	"net"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"golang.org/x/crypto/ssh"
)

// KnownHostsManager 管理已知主机密钥
type KnownHostsManager struct {
	mu       sync.RWMutex
	hostKeys map[string]string // host -> public key
	filePath string
}

var (
	knownHostsManager *KnownHostsManager
	knownHostsOnce    sync.Once
)

// GetKnownHostsManager 获取已知主机密钥管理器单例
func GetKnownHostsManager() *KnownHostsManager {
	knownHostsOnce.Do(func() {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			homeDir = "."
		}
		knownHostsPath := filepath.Join(homeDir, ".next-terminal", "known_hosts")
		knownHostsManager = &KnownHostsManager{
			hostKeys: make(map[string]string),
			filePath: knownHostsPath,
		}
		knownHostsManager.load()
	})
	return knownHostsManager
}

// load 从文件加载已知主机密钥
func (m *KnownHostsManager) load() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	data, err := ioutil.ReadFile(m.filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil // 文件不存在是正常的
		}
		return err
	}

	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.Fields(line)
		if len(parts) >= 3 {
			host := parts[0]
			keyType := parts[1]
			key := parts[2]
			// 存储 host -> keyType key 格式
			m.hostKeys[host] = keyType + " " + key
		}
	}
	return nil
}

// save 保存已知主机密钥到文件
// 注意：调用方必须已持有写锁（saveLocked 不自行加锁，避免与 AddHostKey 的锁重入死锁）
func (m *KnownHostsManager) saveLocked() error {
	dir := filepath.Dir(m.filePath)
	if err := os.MkdirAll(dir, 0700); err != nil {
		return err
	}

	var lines []string
	for host, key := range m.hostKeys {
		lines = append(lines, fmt.Sprintf("%s %s", host, key))
	}

	data := []byte(strings.Join(lines, "\n") + "\n")
	return ioutil.WriteFile(m.filePath, data, 0600)
}

// GetHostKey 获取已知的主机密钥
func (m *KnownHostsManager) GetHostKey(host string) (string, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	key, ok := m.hostKeys[host]
	return key, ok
}

// AddHostKey 添加主机密钥
func (m *KnownHostsManager) AddHostKey(host string, key ssh.PublicKey) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	keyType := key.Type()
	keyBytes := base64.StdEncoding.EncodeToString(key.Marshal())
	m.hostKeys[host] = keyType + " " + keyBytes

	return m.saveLocked()
}

// VerifyHostKey 验证主机密钥
// 返回值: isKnown 是否为已知主机, err 验证错误
func (m *KnownHostsManager) VerifyHostKey(host string, remoteKey ssh.PublicKey) (isKnown bool, err error) {
	storedKeyStr, exists := m.GetHostKey(host)

	if !exists {
		// 未知主机，返回 false 表示需要用户确认
		return false, nil
	}

	// 解析存储的密钥
	parts := strings.Fields(storedKeyStr)
	if len(parts) != 2 {
		return true, errors.New("invalid stored host key format")
	}

	keyType := parts[0]
	keyBytes := parts[1]

	// 检查密钥类型是否匹配
	if remoteKey.Type() != keyType {
		return true, errors.New("host key type mismatch, possible MITM attack")
	}

	// 解码存储的密钥
	storedKeyBytes, err := base64.StdEncoding.DecodeString(keyBytes)
	if err != nil {
		return true, fmt.Errorf("failed to decode stored host key: %v", err)
	}

	// 比较密钥
	remoteKeyBytes := remoteKey.Marshal()
	if string(remoteKeyBytes) != string(storedKeyBytes) {
		return true, errors.New("host key mismatch, possible MITM attack")
	}

	return true, nil
}

// HostKeyCallback 返回一个 ssh.HostKeyCallback
// 当主机未知时，自动接受并保存密钥（首次连接信任）
// 当主机已知时，验证密钥是否匹配
func HostKeyCallback(hostname string, remote net.Addr, key ssh.PublicKey) error {
	manager := GetKnownHostsManager()

	// 格式化主机地址（包含端口）
	host := hostname

	isKnown, err := manager.VerifyHostKey(host, key)
	if err != nil {
		return fmt.Errorf("host key verification failed: %v", err)
	}

	if !isKnown {
		// 首次连接，自动接受并保存主机密钥
		// 在生产环境中，这里应该提示用户确认
		if err := manager.AddHostKey(host, key); err != nil {
			return fmt.Errorf("failed to save host key: %v", err)
		}
	}

	return nil
}

// StrictHostKeyCallback 返回严格的 ssh.HostKeyCallback
// 只接受已知主机，未知主机会被拒绝
func StrictHostKeyCallback(hostname string, remote net.Addr, key ssh.PublicKey) error {
	manager := GetKnownHostsManager()

	host := hostname

	isKnown, err := manager.VerifyHostKey(host, key)
	if err != nil {
		return fmt.Errorf("host key verification failed: %v", err)
	}

	if !isKnown {
		return errors.New("unknown host, connection rejected")
	}

	return nil
}
