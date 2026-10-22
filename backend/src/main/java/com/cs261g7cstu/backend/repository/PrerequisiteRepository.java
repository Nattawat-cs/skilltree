package com.cs261g7cstu.backend.repository;

import com.cs261g7cstu.backend.entity.Prerequisite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PrerequisiteRepository extends JpaRepository<Prerequisite, UUID> {
}
