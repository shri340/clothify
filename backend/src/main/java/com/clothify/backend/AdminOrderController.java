
package com.clothify.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final CustomerOrderRepository orderRepository;

    public AdminOrderController(CustomerOrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllOrders() {

        List<Map<String, Object>> orders = orderRepository
            .findAll()
            .stream()
            .map(order -> {
                Map<String, Object> result = new LinkedHashMap<>();

                result.put("id", order.getId());
                result.put("customerName", order.getCustomerName());
                result.put("phone", order.getPhone());
                result.put("address", order.getAddress());
                result.put("itemsJson", order.getItemsJson());
                result.put("total", order.getTotal());
                result.put("createdAt", order.getCreatedAt());

                return result;
            })
            .toList();

        return ResponseEntity.ok(orders);
    }
}
