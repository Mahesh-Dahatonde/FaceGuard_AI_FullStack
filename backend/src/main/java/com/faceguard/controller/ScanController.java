package com.faceguard.controller;

import com.faceguard.model.Scan;
import com.faceguard.repository.ScanRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scans")
@CrossOrigin(origins = "http://localhost:5173")
public class ScanController {
    private final ScanRepository scans;

    public ScanController(ScanRepository scans) {
        this.scans = scans;
    }

    @GetMapping("/{userId}")
    public List<Scan> history(@PathVariable Long userId) {
        return scans.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PostMapping
    public ResponseEntity<?> save(@RequestBody Map<String, Object> body) {
        try {
            Long userId = Long.valueOf(body.get("userId").toString());
            Scan scan = new Scan(
                userId,
                body.get("result").toString(),
                Double.parseDouble(body.get("confidence").toString()),
                Double.parseDouble(body.get("depthScore").toString()),
                Double.parseDouble(body.get("textureScore").toString()),
                Double.parseDouble(body.get("fusionScore").toString())
            );
            return ResponseEntity.ok(scans.save(scan));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid scan data."));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        scans.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Scan deleted."));
    }
}
