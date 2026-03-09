package dev.amitwani.mcp_spring_java.dto.leave;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDto {
    private String reason;
    private LocalDate startDate;
    private LocalDate endDate;
}
