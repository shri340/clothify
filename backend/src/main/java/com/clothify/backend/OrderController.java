
package com.clothify.backend;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")

public class OrderController {

    private final CustomerOrderRepository orderRepository;

    /*
     * Keep these prices synchronized with ProductController.
     */
    private static final Map<Integer, Integer> PRODUCT_PRICES =
            Map.ofEntries(
                    Map.entry(1, 599),
                    Map.entry(2, 599),
                    Map.entry(3, 1299),
                    Map.entry(4, 1299),
                    Map.entry(5, 999),
                    Map.entry(6, 1499),
                    Map.entry(7, 1199),
                    Map.entry(8, 1099),
                    Map.entry(9, 699),
                    Map.entry(10, 1999),
                    Map.entry(11, 1299),
                    Map.entry(12, 599),
                    Map.entry(13, 899),
                    Map.entry(14, 1099)
            );

   private static final Set<String> CLOTHING_SIZES =
        Set.of("S", "M", "L", "XL");

private static final Set<String> SHOE_SIZES =
        Set.of("7", "8", "9", "10", "11");

    public OrderController(CustomerOrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(
            @RequestBody Map<String, Object> request) {

        if (request == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Order details are required."));
        }

        String name = readText(request.get("name"));
        String phone = readText(request.get("phone"));
        String address = readText(request.get("address"));

        
if (name.isBlank() || phone.isBlank() || address.isBlank()) {
    return ResponseEntity.badRequest()
            .body(Map.of(
                    "message",
                    "Name, phone, and address are required."
            ));
}

if (name.length() < 2 || name.length() > 200) {
    return ResponseEntity.badRequest()
            .body(Map.of(
                    "message",
                    "Name must be between 2 and 200 characters."
            ));
}

if (!phone.matches("[0-9]{10}")) {
    return ResponseEntity.badRequest()
            .body(Map.of(
                    "message",
                    "Phone number must contain exactly 10 digits."
            ));
}

if (address.length() < 10 || address.length() > 1000) {
    return ResponseEntity.badRequest()
            .body(Map.of(
                    "message",
                    "Address must be between 10 and 1000 characters."
            ));
}


        Object itemsObject = request.get("items");

        if (!(itemsObject instanceof List<?> items) || items.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Your cart is empty."));
        }
        if (items.size() > 50) {
    return ResponseEntity.badRequest()
            .body(Map.of("message", "An order cannot contain more than 50 items."));
}

      int total = 0;
List<Map<String, Object>> savedItems = new ArrayList<>();
Set<Integer> seenProductIds = new HashSet<>();

        try {
            for (Object itemObject : items) {
                if (!(itemObject instanceof Map<?, ?> item)) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Invalid order item."));
                }

                int id = Integer.parseInt(
                        String.valueOf(item.get("id")));
                        if (!seenProductIds.add(id)) {
    return ResponseEntity.badRequest()
            .body(Map.of(
                    "message",
                    "Duplicate products are not allowed in an order."
            ));
}

                int quantity = Integer.parseInt(
                        String.valueOf(item.get("quantity")));

                if (quantity < 1 || quantity > 100) {
                    return ResponseEntity.badRequest()
                            .body(Map.of(
                                    "message",
                                    "Quantity must be between 1 and 100."
                            ));
                }

                Integer price = PRODUCT_PRICES.get(id);

                if (price == null) {
                    return ResponseEntity.badRequest()
                            .body(Map.of(
                                    "message",
                                    "Invalid product ID: " + id
                            ));
                }

               String size = readText(item.get("size")).toUpperCase();

Set<String> allowedSizes =
        id == 10 ? SHOE_SIZES : CLOTHING_SIZES;

if (!allowedSizes.contains(size)) {
    return ResponseEntity.badRequest()
            .body(Map.of(
                    "message",
                    "Invalid size for the selected product."
            ));
}

                total = Math.addExact(
                        total,
                        Math.multiplyExact(price, quantity)
                );

                Map<String, Object> savedItem = new LinkedHashMap<>();
                savedItem.put("id", id);
                savedItem.put("quantity", quantity);
                savedItem.put("size", size);
                savedItem.put("price", price);

                savedItems.add(savedItem);
            }

            String itemsJson = toJson(savedItems);

            CustomerOrder order = new CustomerOrder();

            // Match the actual CustomerOrder entity field names.
            order.setCustomerName(name);
            order.setPhone(phone);
            order.setAddress(address);
            order.setItemsJson(itemsJson);
            order.setTotal(total);

            CustomerOrder savedOrder = orderRepository.save(order);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "message", "Order placed successfully.",
                            "orderId", savedOrder.getId(),
                            "total", total
                    )
            );

        } catch (NumberFormatException | ArithmeticException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Invalid quantity or product information."
                    ));
        }
    }

    private String readText(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    /*
     * Serializes order items to JSON without requiring ObjectMapper.
     */
    private String toJson(List<Map<String, Object>> items) {
        StringBuilder json = new StringBuilder("[");
        boolean firstItem = true;

        for (Map<String, Object> item : items) {
            if (!firstItem) {
                json.append(',');
            }

            firstItem = false;
            json.append('{');

            boolean firstField = true;

            for (Map.Entry<String, Object> field : item.entrySet()) {
                if (!firstField) {
                    json.append(',');
                }

                firstField = false;

                json.append('"')
                        .append(escapeJson(field.getKey()))
                        .append("\":");

                Object value = field.getValue();

                if (value instanceof Number || value instanceof Boolean) {
                    json.append(value);
                } else {
                    json.append('"')
                            .append(escapeJson(String.valueOf(value)))
                            .append('"');
                }
            }

            json.append('}');
        }

        return json.append(']').toString();
    }

    private String escapeJson(String value) {
        StringBuilder escaped = new StringBuilder();

        for (int i = 0; i < value.length(); i++) {
            char ch = value.charAt(i);

            switch (ch) {
                case '"' -> escaped.append("\\\"");
                case '\\' -> escaped.append("\\\\");
                case '\b' -> escaped.append("\\b");
                case '\f' -> escaped.append("\\f");
                case '\n' -> escaped.append("\\n");
                case '\r' -> escaped.append("\\r");
                case '\t' -> escaped.append("\\t");
                default -> {
                    if (ch < 0x20) {
                        escaped.append(
                                String.format("\\u%04x", (int) ch)
                        );
                    } else {
                        escaped.append(ch);
                    }
                }
            }
        }

        return escaped.toString();
    }
}
