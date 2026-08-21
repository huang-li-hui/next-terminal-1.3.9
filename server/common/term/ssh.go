package term

import (
	"fmt"
	"net"
	"time"

	"golang.org/x/crypto/ssh"
	"golang.org/x/net/proxy"
)

// HostKeyVerificationMode 主机密钥验证模式
type HostKeyVerificationMode int

const (
	// HostKeyVerificationAuto 自动接受新主机密钥（首次连接信任）
	HostKeyVerificationAuto HostKeyVerificationMode = iota
	// HostKeyVerificationStrict 只接受已知主机
	HostKeyVerificationStrict
	// HostKeyVerificationInsecure 不验证主机密钥（不安全，仅用于兼容旧版本）
	HostKeyVerificationInsecure
)

// DefaultHostKeyVerificationMode 默认使用自动模式
var DefaultHostKeyVerificationMode = HostKeyVerificationAuto

func NewSshClient(ip string, port int, username, password, privateKey, passphrase string) (*ssh.Client, error) {
	var authMethod ssh.AuthMethod
	if username == "-" || username == "" {
		username = "root"
	}
	if password == "-" {
		password = ""
	}
	if privateKey == "-" {
		privateKey = ""
	}
	if passphrase == "-" {
		passphrase = ""
	}

	var err error
	if privateKey != "" {
		var key ssh.Signer
		if len(passphrase) > 0 {
			key, err = ssh.ParsePrivateKeyWithPassphrase([]byte(privateKey), []byte(passphrase))
			if err != nil {
				return nil, err
			}
		} else {
			key, err = ssh.ParsePrivateKey([]byte(privateKey))
			if err != nil {
				return nil, err
			}
		}
		authMethod = ssh.PublicKeys(key)
	} else {
		authMethod = ssh.Password(password)
	}

	// 根据验证模式选择主机密钥回调
	var hostKeyCallback ssh.HostKeyCallback
	switch DefaultHostKeyVerificationMode {
	case HostKeyVerificationStrict:
		hostKeyCallback = StrictHostKeyCallback
	case HostKeyVerificationInsecure:
		hostKeyCallback = ssh.InsecureIgnoreHostKey()
	default:
		hostKeyCallback = HostKeyCallback
	}

	config := &ssh.ClientConfig{
		Timeout:         3 * time.Second,
		User:            username,
		Auth:            []ssh.AuthMethod{authMethod},
		HostKeyCallback: hostKeyCallback,
	}

	addr := fmt.Sprintf("%s:%d", ip, port)
	return ssh.Dial("tcp", addr, config)
}

func NewSshClientUseSocks(ip string, port int, username, password, privateKey, passphrase string, socksProxyHost, socksProxyPort, socksProxyUsername, socksProxyPassword string) (*ssh.Client, error) {
	var authMethod ssh.AuthMethod
	if username == "-" || username == "" {
		username = "root"
	}
	if password == "-" {
		password = ""
	}
	if privateKey == "-" {
		privateKey = ""
	}
	if passphrase == "-" {
		passphrase = ""
	}

	var err error
	if privateKey != "" {
		var key ssh.Signer
		if len(passphrase) > 0 {
			key, err = ssh.ParsePrivateKeyWithPassphrase([]byte(privateKey), []byte(passphrase))
			if err != nil {
				return nil, err
			}
		} else {
			key, err = ssh.ParsePrivateKey([]byte(privateKey))
			if err != nil {
				return nil, err
			}
		}
		authMethod = ssh.PublicKeys(key)
	} else {
		authMethod = ssh.Password(password)
	}

	// 根据验证模式选择主机密钥回调
	var hostKeyCallback ssh.HostKeyCallback
	switch DefaultHostKeyVerificationMode {
	case HostKeyVerificationStrict:
		hostKeyCallback = StrictHostKeyCallback
	case HostKeyVerificationInsecure:
		hostKeyCallback = ssh.InsecureIgnoreHostKey()
	default:
		hostKeyCallback = HostKeyCallback
	}

	config := &ssh.ClientConfig{
		Timeout:         3 * time.Second,
		User:            username,
		Auth:            []ssh.AuthMethod{authMethod},
		HostKeyCallback: hostKeyCallback,
	}

	socksProxyAddr := fmt.Sprintf("%s:%s", socksProxyHost, socksProxyPort)

	socks5, err := proxy.SOCKS5("tcp", socksProxyAddr,
		&proxy.Auth{User: socksProxyUsername, Password: socksProxyPassword},
		&net.Dialer{
			Timeout:   30 * time.Second,
			KeepAlive: 30 * time.Second,
		},
	)
	if err != nil {
		return nil, err
	}

	addr := fmt.Sprintf("%s:%d", ip, port)
	conn, err := socks5.Dial("tcp", addr)
	if err != nil {
		return nil, err
	}

	clientConn, channels, requests, err := ssh.NewClientConn(conn, addr, config)
	if err != nil {
		return nil, err
	}

	return ssh.NewClient(clientConn, channels, requests), nil
}
