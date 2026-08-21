package repository

import (
	"context"
	"sort"
	"strings"

	"next-terminal/server/common/nt"
	"next-terminal/server/env"

	"gorm.io/gorm"
)

type baseRepository struct {
}

func (b *baseRepository) GetDB(c context.Context) *gorm.DB {
	db, ok := c.Value(nt.DB).(*gorm.DB)
	if !ok {
		return env.GetDB()
	}
	return db
}

// validOrderFields 存储有效的排序方向
var validOrderDirections = map[string]bool{
	"asc":  true,
	"desc": true,
	"ASC":  true,
	"DESC": true,
}

// ValidateOrderField 验证排序字段和方向，防止SQL注入
// allowedFields: 允许排序的字段白名单
// field: 请求的排序字段
// order: 排序方向 (asc/desc)
// prefix: 字段前缀，如 "assets." 或 "users."
// 返回安全的排序语句
func ValidateOrderField(allowedFields map[string]bool, field, order, prefix string) string {
	// 验证排序字段是否在白名单中
	if !allowedFields[field] {
		// 默认使用字典序最小的允许字段，保证结果确定
		fields := make([]string, 0, len(allowedFields))
		for f := range allowedFields {
			fields = append(fields, f)
		}
		sort.Strings(fields)
		if len(fields) == 0 {
			return ""
		}
		field = fields[0]
	}

	// 验证排序方向
	if !validOrderDirections[order] {
		order = "desc"
	}

	// 构建安全的排序语句
	if prefix != "" {
		return prefix + field + " " + strings.ToLower(order)
	}
	return field + " " + strings.ToLower(order)
}

// SafeOrder 安全地返回排序语句，防止SQL注入
// field: 排序字段
// order: 排序方向
// allowedFields: 允许的字段白名单
// defaultField: 默认排序字段
// prefix: 字段前缀
func SafeOrder(field, order string, allowedFields []string, defaultField, prefix string) string {
	// 检查字段是否在白名单中
	fieldAllowed := false
	for _, f := range allowedFields {
		if f == field {
			fieldAllowed = true
			break
		}
	}
	if !fieldAllowed {
		field = defaultField
	}

	// 验证排序方向
	order = strings.ToLower(order)
	if order != "asc" && order != "desc" {
		order = "desc"
	}

	// 构建安全的排序语句
	if prefix != "" {
		return prefix + field + " " + order
	}
	return field + " " + order
}
