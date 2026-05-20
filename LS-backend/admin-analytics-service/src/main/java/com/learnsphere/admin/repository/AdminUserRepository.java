package com.learnsphere.admin.repository;

import com.learnsphere.admin.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
    List<AdminUser> findByDeletedAtIsNull();
}

