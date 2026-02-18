package com.learnsphere.admin.controller;

import com.learnsphere.admin.dto.DashboardResponse;
import com.learnsphere.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService service;

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return service.getDashboard();
    }
}
