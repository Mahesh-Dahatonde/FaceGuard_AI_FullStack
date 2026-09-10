package com.faceguard.repository;

import com.faceguard.model.Scan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScanRepository extends JpaRepository<Scan, Long> {
    List<Scan> findByUserIdOrderByCreatedAtDesc(Long userId);
}
