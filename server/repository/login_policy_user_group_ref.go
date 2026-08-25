package repository

import (
	"context"

	"next-terminal/server/model"
)

var LoginPolicyUserGroupRefRepository = new(loginPolicyUserGroupRefRepository)

type loginPolicyUserGroupRefRepository struct {
	baseRepository
}

func (r loginPolicyUserGroupRefRepository) Create(c context.Context, m *model.LoginPolicyUserGroupRef) error {
	return r.GetDB(c).Create(m).Error
}

func (r loginPolicyUserGroupRefRepository) CreateInBatches(c context.Context, m []model.LoginPolicyUserGroupRef) error {
	return r.GetDB(c).CreateInBatches(m, 100).Error
}

func (r loginPolicyUserGroupRefRepository) FindByLoginPolicyId(c context.Context, loginPolicyId string) (items []model.LoginPolicyUserGroupRef, err error) {
	err = r.GetDB(c).Where("login_policy_id = ?", loginPolicyId).Find(&items).Error
	return
}

func (r loginPolicyUserGroupRefRepository) FindByUserGroupId(c context.Context, userGroupId string) (items []model.LoginPolicyUserGroupRef, err error) {
	err = r.GetDB(c).Where("user_group_id = ?", userGroupId).Find(&items).Error
	return
}

func (r loginPolicyUserGroupRefRepository) DeleteByLoginPolicyId(c context.Context, loginPolicyId string) error {
	return r.GetDB(c).Where("login_policy_id = ?", loginPolicyId).Delete(model.LoginPolicyUserGroupRef{}).Error
}

func (r loginPolicyUserGroupRefRepository) DeleteByLoginPolicyIdAndUserGroupId(c context.Context, loginPolicyId, userGroupId string) error {
	return r.GetDB(c).Where("login_policy_id = ? and user_group_id = ?", loginPolicyId, userGroupId).Delete(model.LoginPolicyUserGroupRef{}).Error
}

func (r loginPolicyUserGroupRefRepository) DeleteId(c context.Context, id string) error {
	return r.GetDB(c).Where("id = ?", id).Delete(model.LoginPolicyUserGroupRef{}).Error
}

// FindUserGroupPage 查询已绑定到指定登录策略的用户组分页数据
func (r loginPolicyUserGroupRefRepository) FindUserGroupPage(c context.Context, pageIndex, pageSize int, loginPolicyId, name, order, field string) (o []model.UserGroupForPage, total int64, err error) {
	db := r.GetDB(c).Table("user_groups").
		Joins("join login_policies_user_group_ref as ref on user_groups.id = ref.user_group_id").
		Where("ref.login_policy_id = ?", loginPolicyId)
	dbCounter := r.GetDB(c).Table("user_groups").
		Joins("join login_policies_user_group_ref as ref on user_groups.id = ref.user_group_id").
		Where("ref.login_policy_id = ?", loginPolicyId)

	if len(name) > 0 {
		db = db.Where("user_groups.name like ?", "%"+name+"%")
		dbCounter = dbCounter.Where("user_groups.name like ?", "%"+name+"%")
	}

	err = dbCounter.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	if order == "ascend" {
		order = "asc"
	} else {
		order = "desc"
	}

	if field == "name" {
		field = "user_groups.name"
	} else {
		field = "user_groups.created"
	}

	err = db.Order(field + " " + order).Find(&o).Offset((pageIndex - 1) * pageSize).Limit(pageSize).Error
	if o == nil {
		o = make([]model.UserGroupForPage, 0)
	}
	return
}
