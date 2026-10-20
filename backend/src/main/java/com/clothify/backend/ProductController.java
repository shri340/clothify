
package com.clothify.backend;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @GetMapping("/api/products")
    public List<Map<String, Object>> getProducts() {
        return List.of(
            Map.of(
                "id", 1,
                "name", "Classic White T-Shirt",
                "price", 499,
                "category", "Men",
                "image", "https://placehold.co/300x400?text=White+T-Shirt"
            ),
            Map.of(
                "id", 2,
                "name", "Casual Denim Jacket",
                "price", 1299,
                "category", "Women",
                "image", "https://placehold.co/300x400?text=Denim+Jacket"
            ),
            Map.of(
                "id", 3,
                "name", "Everyday Sneakers",
                "price", 999,
                "category", "Footwear",
                "image", "https://placehold.co/300x400?text=Sneakers"
            )
        );
    }
}
