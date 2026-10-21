
package com.clothify.backend;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://clothify-qjfd.onrender.com"
})
public class ProductController {

    @GetMapping("/api/products")
    public List<Map<String, Object>> getProducts() {
        return List.of(
            Map.of(
                "id", 1,
                "name", "Classic Oversized White T-Shirt",
                "price", 599,
                "category", "Men",
                "image", "https://placehold.co/600x800?text=White+Oversized+Tee"
            ),
            Map.of(
                "id", 2,
                "name", "Classic Oversized Black T-Shirt",
                "price", 599,
                "category", "Men",
                "image", "https://placehold.co/600x800?text=Black+Oversized+Tee"
            ),
            Map.of(
                "id", 3,
                "name", "Premium Cream Hoodie",
                "price", 1299,
                "category", "Men",
                "image", "https://placehold.co/600x800?text=Cream+Hoodie"
            ),
            Map.of(
                "id", 4,
                "name", "Premium Black Hoodie",
                "price", 1299,
                "category", "Men",
                "image", "https://placehold.co/600x800?text=Black+Hoodie"
            ),
            Map.of(
                "id", 5,
                "name", "Classic Linen Shirt",
                "price", 999,
                "category", "Men",
                "image", "https://placehold.co/600x800?text=Linen+Shirt"
            ),
            Map.of(
                "id", 6,
                "name", "Black Denim Jacket",
                "price", 1499,
                "category", "Men",
                "image", "https://placehold.co/600x800?text=Denim+Jacket"
            ),
            Map.of(
                "id", 7,
                "name", "Everyday Cargo Pants",
                "price", 1199,
                "category", "Men",
                "image", "https://placehold.co/600x800?text=Cargo+Pants"
            ),
            Map.of(
                "id", 8,
                "name", "Straight Fit Jeans",
                "price", 1099,
                "category", "Men",
                "image", "https://placehold.co/600x800?text=Straight+Fit+Jeans"
            ),
            Map.of(
                "id", 9,
                "name", "Classic Navy Polo T-Shirt",
                "price", 699,
                "category", "Men",
                "image", "https://placehold.co/600x800?text=Navy+Polo"
            ),
            Map.of(
                "id", 10,
                "name", "Black and White Sneakers",
                "price", 1999,
                "category", "Footwear",
                "image", "https://placehold.co/600x800?text=Sneakers"
            )
        );
    }
}
