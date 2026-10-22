package com.cs261g7cstu.backend.service;

import com.cs261g7cstu.backend.dto.TuVerifyResponseDTO;
import com.cs261g7cstu.backend.dto.UserDTO;
import com.cs261g7cstu.backend.entity.User;
import com.cs261g7cstu.backend.mapper.UserMapper;
import com.cs261g7cstu.backend.repository.UserRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @Cacheable(value = "users", key = "#response.username()")
    public UserDTO getOrCreate(TuVerifyResponseDTO response) {
        User user = userRepository.findByStudentId(response.username())
                .orElseGet(() -> userRepository.save(userMapper.toEntity(response)));
        return userMapper.toDTO(user);
    }
}
