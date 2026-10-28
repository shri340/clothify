
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
            // Men's collection
            Map.of(
                "id", 1,
                "name", "Classic Oversized White T-Shirt",
                "price", 599,
                "category", "Men",
                "image", "/images/white-tee.jpg",
                "sizes", List.of("S", "M", "L", "XL")
            ),
            Map.of(
                "id", 2,
                "name", "Classic Oversized Black T-Shirt",
                "price", 599,
                "category", "Men",
                "image", "/images/black-tee.jpg",
                "sizes", List.of("S", "M", "L", "XL")
            ),
            Map.of(
                "id", 3,
                "name", "Premium Cream Hoodie",
                "price", 1299,
                "category", "Men",
                "image", "/images/cream-hoodie.jpg",
                "sizes", List.of("S", "M", "L", "XL")
            ),
            Map.of(
                "id", 4,
                "name", "Premium Black Hoodie",
                "price", 1299,
                "category", "Men",
                "image", "/images/black-hoodie.jpg",
                "sizes", List.of("S", "M", "L", "XL")
            ),
            Map.of(
                "id", 5,
                "name", "Classic Linen Shirt",
                "price", 999,
                "category", "Men",
                "image", "/images/linen-shirt.jpg",
                "sizes", List.of("S", "M", "L", "XL")
            ),
            Map.of(
                "id", 6,
                "name", "Black Denim Jacket",
                "price", 1499,
                "category", "Men",
                "image", "/images/denim-jacket.jpg",
                "sizes", List.of("S", "M", "L", "XL")
            ),
            Map.of(
                "id", 7,
                "name", "Everyday Cargo Pants",
                "price", 1199,
                "category", "Men",
                "image", "/images/cargo-pants.jpg",
                "sizes", List.of("S", "M", "L", "XL")
            ),
            Map.of(
                "id", 8,
                "name", "Straight Fit Jeans",
                "price", 1099,
                "category", "Men",
                "image", "/images/straight-jeans.jpg",
                "sizes", List.of("S", "M", "L", "XL")
            ),
            Map.of(
                "id", 9,
                "name", "Classic Navy Polo T-Shirt",
                "price", 699,
                "category", "Men",
                "image", "/images/navy-polo.jpg",
                "sizes", List.of("S", "M", "L", "XL")
            ),
            Map.of(
                "id", 10,
                "name", "Black and White Sneakers",
                "price", 1999,
                "category", "Footwear",
                "image", "/images/sneakers.jpg",
                "sizes", List.of("7", "8", "9", "10", "11")
            ),

            // Women's collection
            Map.of(
                "id", 11,
                "name", "Floral Midi Dress",
                "price", 1299,
                "category", "Women",
                "image", "/images/women-floral-dress.jpg",
                "sizes", List.of("S", "M", "L", "XL")
            ),
            Map.of(
                "id", 12,
                "name", "Elegant Crop Top",
                "price", 599,
                "category", "Women",
                "image", "/images/women-crop-top.jpg",
                "sizes", List.of("S", "M", "L", "XL")
            ),
            Map.of(
                "id", 13,
                "name", "Pleated Midi Skirt",
                "price", 899,
                "category", "Women",
                "image", "/images/women-midi-skirt.jpg",
                "sizes", List.of("S", "M", "L", "XL")
            ),
            Map.of(
                "id", 14,
                "name", "High-Waist Trousers",
                "price", 1099,
                "category", "Women",
                "image", "/images/women-trousers.jpg",
                "sizes", List.of("S", "M", "L", "XL")
            )
        );
    }
}
