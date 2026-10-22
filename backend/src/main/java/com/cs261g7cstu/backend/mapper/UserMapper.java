package com.cs261g7cstu.backend.mapper;

import com.cs261g7cstu.backend.dto.TuVerifyResponseDTO;
import com.cs261g7cstu.backend.dto.UserDTO;
import com.cs261g7cstu.backend.entity.User;
import com.cs261g7cstu.backend.enums.Role;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(TuVerifyResponseDTO response) {
        User user = new User();
        user.setStudentId(response.username());
        user.setDisplayNameTh(response.displayNameTh());
        user.setDisplayNameEn(response.displayNameEn());
        user.setEmail(response.email());
        user.setTuStatus(response.tuStatus());
        user.setFaculty(response.faculty());
        user.setDepartment(response.department());
        user.setRole(Role.STUDENT);
        return user;
    }

    public UserDTO toDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getStudentId(),
                user.getDisplayNameTh(),
                user.getDisplayNameEn(),
                user.getEmail(),
                user.getTuStatus(),
                user.getFaculty(),
                user.getDepartment()
        );
    }
}
