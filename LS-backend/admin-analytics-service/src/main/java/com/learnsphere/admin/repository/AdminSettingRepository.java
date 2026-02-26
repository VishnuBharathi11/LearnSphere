package com.learnsphere.admin.repository;

import com.learnsphere.admin.entity.AdminSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminSettingRepository extends JpaRepository<AdminSetting, Long> {
}

