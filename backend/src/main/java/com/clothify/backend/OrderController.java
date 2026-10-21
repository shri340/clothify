
package com.clothify.backend;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://clothify-qjfd.onrender.com"
})
public class OrderController {

    private final CustomerOrderRepository orderRepository;

    public OrderController(CustomerOrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @PostMapping
    public Map<String, Object> createOrder(
            @RequestBody Map<String, Object> request) {

        String name = requiredText(request, "customerName");
        String phone = requiredText(request, "phone");
        String address = requiredText(request, "address");

        Object rawItems = request.get("items");

        if (!(rawItems instanceof List<?> items) || items.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Cart cannot be empty"
            );
        }

        // Prices must match ProductController.java
        Map<Integer, Integer> prices = Map.of(
            1, 599,
            2, 599,
            3, 1299,
            4, 1299,
            5, 999,
            6, 1499,
            7, 1199,
            8, 1099,
            9, 699,
            10, 1999
        );

        double total = 0;
        StringBuilder itemsJson = new StringBuilder("[");
        boolean first = true;

        for (Object rawItem : items) {
            if (!(rawItem instanceof Map<?, ?> item)) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid cart item"
                );
            }

            int id = readInteger(item.get("id"), "product id");
            int quantity = readInteger(item.get("quantity"), "quantity");

            Integer price = prices.get(id);

            if (price == null || quantity < 1 || quantity > 100) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid product or quantity"
                );
            }

            total += (double) price * quantity;

            if (!first) {
                itemsJson.append(",");
            }

            itemsJson.append("{\"id\":")
                .append(id)
                .append(",\"quantity\":")
                .append(quantity)
                .append(",\"price\":")
                .append(price)
                .append("}");

            first = false;
        }

        itemsJson.append("]");

        CustomerOrder order = new CustomerOrder();
        order.setCustomerName(name);
        order.setPhone(phone);
        order.setAddress(address);
        order.setTotal(total);
        order.setItemsJson(itemsJson.toString());

        CustomerOrder saved = orderRepository.save(order);

        return Map.of(
            "message", "Order saved successfully",
            "orderId", saved.getId(),
            "total", saved.getTotal()
        );
    }

    private String requiredText(
            Map<String, Object> request, String key) {

        Object value = request.get(key);

        if (!(value instanceof String text) || text.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                key + " is required"
            );
        }

        String result = text.trim();

        if (result.length() >
                (key.equals("address") ? 1000 : 200)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                key + " is too long"
            );
        }

        return result;
    }

    private int readInteger(Object value, String field) {
        if (!(value instanceof Number number)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid " + field
            );
        }

        double numericValue = number.doubleValue();

        if (!Double.isFinite(numericValue)
                || numericValue != Math.rint(numericValue)
                || numericValue < 1
                || numericValue > Integer.MAX_VALUE) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid " + field
            );
        }

        return (int) numericValue;
    }
}
