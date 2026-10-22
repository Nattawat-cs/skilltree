package com.cs261g7cstu.backend.client;

import com.cs261g7cstu.backend.dto.TuVerifyRequestDTO;
import com.cs261g7cstu.backend.dto.TuVerifyResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class TuApiClient {

    private static final String VERIFY_PATH = "/api/v1/auth/Ad/verify";

    private final RestClient restClient;
    private final String applicationKey;

    public TuApiClient(@Value("${tu.api.base-url}") String baseUrl,
                       @Value("${tu.api.application-key}") String applicationKey) {
        this.restClient = RestClient.create(baseUrl);
        this.applicationKey = applicationKey;
    }

    public TuVerifyResponseDTO verify(String username, String password) {
        return restClient.post()
                .uri(VERIFY_PATH)
                .header("Application-Key", applicationKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new TuVerifyRequestDTO(username, password))
                .retrieve()
                // TU API ตอบ 4xx พร้อม body {status: false} เมื่อรหัสผิด ให้ AuthService เป็นคนตัดสิน
                .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                })
                .body(TuVerifyResponseDTO.class);
    }
}
