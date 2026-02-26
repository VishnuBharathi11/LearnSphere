package com.learnsphere.admin.repository;

import com.learnsphere.admin.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    Optional<RolePermission> findByRole(String role);
}

