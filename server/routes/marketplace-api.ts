import express from "express";
import { z } from "zod";
import { db } from "../db";
import {
  products,
  productVariants,
  productCategories,
  campaigns,
  campaignProducts,
  productBoosts,
  marketplaceOrders,
  orderStatusLogs,
  shoppingCarts,
  cartItems,
  wishlists,
  wishlistItems,
  marketplaceReviews,
  reviewResponses,
  reviewHelpfulness,
  marketplaceDisputes,
  productAnalytics,
  sellerAnalytics,
  sellerScores,
  productPriceHistory,
  productRecommendations,
  walletTransactions,
  escrowContracts,
  chatThreads,
  chatMessages,
} from "../../shared/enhanced-schema";
import {
  eq,
  and,
  desc,
  asc,
  like,
  gte,
  lte,
  inArray,
  sql,
  count,
} from "drizzle-orm";
import { authenticateToken } from "../middleware/auth";
import { validateAdmin } from "../middleware/admin";

const router = express.Router();

// =============================================================================
// PRODUCTS API
// =============================================================================

// Get products with filtering and pagination
router.get("/products", async (req, res) => {
  try {
    const {
      category,
      subcategory,
      productType,
      minPrice,
      maxPrice,
      rating,
      inStock,
      isFeatured,
      isSponsored,
      tags,
      searchQuery,
      sortBy = "recent",
      page = 1,
      limit = 20,
      sellerId,
    } = req.query;

    let query = db.select().from(products);
    const conditions = [];

    // Apply filters
    if (category) conditions.push(eq(products.category, category as string));
    if (subcategory)
      conditions.push(eq(products.subcategory, subcategory as string));
    if (productType)
      conditions.push(eq(products.productType, productType as string));
    if (minPrice)
      conditions.push(gte(products.price, parseFloat(minPrice as string)));
    if (maxPrice)
      conditions.push(lte(products.price, parseFloat(maxPrice as string)));
    if (rating)
      conditions.push(
        gte(products.averageRating, parseFloat(rating as string)),
      );
    if (inStock === "true") conditions.push(eq(products.inStock, true));
    if (inStock === "false") conditions.push(eq(products.inStock, false));
    if (isFeatured === "true") conditions.push(eq(products.isFeatured, true));
    if (isSponsored === "true") conditions.push(eq(products.isSponsored, true));
    if (sellerId) conditions.push(eq(products.sellerId, sellerId as string));
    if (searchQuery) {
      conditions.push(
        sql`(${products.name} ILIKE ${"%" + searchQuery + "%"} OR ${products.description} ILIKE ${"%" + searchQuery + "%"})`,
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        query = query.orderBy(asc(products.price));
        break;
      case "price-high":
        query = query.orderBy(desc(products.price));
        break;
      case "rating":
        query = query.orderBy(desc(products.averageRating));
        break;
      case "popular":
        query = query.orderBy(desc(products.totalSales));
        break;
      case "boosted":
        query = query.orderBy(desc(products.boostLevel));
        break;
      case "recent":
      default:
        query = query.orderBy(desc(products.createdAt));
        break;
    }

    // Apply pagination
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    query = query.limit(parseInt(limit as string)).offset(offset);

    const result = await query;

    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    const total = totalResult[0]?.count || 0;

    res.json({
      products: result,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get single product by ID
router.get("/products/:id", async (req, res) => {
  try {
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, req.params.id))
      .limit(1);

    if (!product[0]) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Get product variants
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, req.params.id));

    // Track product view
    if (req.user?.id) {
      await db.insert(productAnalytics).values({
        productId: req.params.id,
        userId: req.user.id,
        eventType: "view",
        source: (req.query.source as string) || "direct",
        ipAddress: req.ip,
        userAgent: req.get("User-Agent") || "",
        deviceType: req.get("User-Agent")?.includes("Mobile")
          ? "mobile"
          : "desktop",
        sessionId: req.sessionID,
      });

      // Update product view count
      await db
        .update(products)
        .set({
          viewCount: sql`${products.viewCount} + 1`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(products.id, req.params.id));
    }

    res.json({
      ...product[0],
      variants,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Create new product
router.post("/products", authenticateToken, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      sellerId: req.user.id,
      status: "active",
      boostLevel: 0,
      averageRating: 0,
      totalReviews: 0,
      totalSales: 0,
      viewCount: 0,
      clickCount: 0,
      favoriteCount: 0,
    };

    const [newProduct] = await db
      .insert(products)
      .values(productData)
      .returning();

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Update product
router.put("/products/:id", authenticateToken, async (req, res) => {
  try {
    // Verify ownership
    const existingProduct = await db
      .select()
      .from(products)
      .where(
        and(eq(products.id, req.params.id), eq(products.sellerId, req.user.id)),
      )
      .limit(1);

    if (!existingProduct[0]) {
      return res
        .status(404)
        .json({ error: "Product not found or unauthorized" });
    }

    const [updatedProduct] = await db
      .update(products)
      .set({ ...req.body, updatedAt: new Date().toISOString() })
      .where(eq(products.id, req.params.id))
      .returning();

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product
router.delete("/products/:id", authenticateToken, async (req, res) => {
  try {
    // Verify ownership
    const existingProduct = await db
      .select()
      .from(products)
      .where(
        and(eq(products.id, req.params.id), eq(products.sellerId, req.user.id)),
      )
      .limit(1);

    if (!existingProduct[0]) {
      return res
        .status(404)
        .json({ error: "Product not found or unauthorized" });
    }

    await db.delete(products).where(eq(products.id, req.params.id));

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// =============================================================================
// CATEGORIES API
// =============================================================================

router.get("/categories", async (req, res) => {
  try {
    const categoriesResult = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.isActive, true))
      .orderBy(asc(productCategories.sortOrder));

    res.json(categoriesResult);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// =============================================================================
// CAMPAIGNS API
// =============================================================================

router.get("/campaigns", async (req, res) => {
  try {
    const now = new Date().toISOString();
    const campaignsResult = await db
      .select()
      .from(campaigns)
      .where(
        and(
          eq(campaigns.isPublic, true),
          eq(campaigns.status, "active"),
          lte(campaigns.startDate, now),
          gte(campaigns.endDate, now),
        ),
      )
      .orderBy(desc(campaigns.createdAt));

    res.json(campaignsResult);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

// Request campaign participation
router.post(
  "/campaigns/:campaignId/join",
  authenticateToken,
  async (req, res) => {
    try {
      const { productId } = req.body;

      // Verify product ownership
      const product = await db
        .select()
        .from(products)
        .where(
          and(eq(products.id, productId), eq(products.sellerId, req.user.id)),
        )
        .limit(1);

      if (!product[0]) {
        return res
          .status(404)
          .json({ error: "Product not found or unauthorized" });
      }

      // Check if already participating
      const existing = await db
        .select()
        .from(campaignProducts)
        .where(
          and(
            eq(campaignProducts.campaignId, req.params.campaignId),
            eq(campaignProducts.productId, productId),
          ),
        )
        .limit(1);

      if (existing[0]) {
        return res
          .status(400)
          .json({ error: "Product already participating in campaign" });
      }

      const [participation] = await db
        .insert(campaignProducts)
        .values({
          campaignId: req.params.campaignId,
          productId,
          requestedBy: req.user.id,
          status: "pending",
          featuredOrder: 0,
          campaignViews: 0,
          campaignClicks: 0,
          campaignSales: 0,
          campaignRevenue: 0,
        })
        .returning();

      res.status(201).json(participation);
    } catch (error) {
      console.error("Error joining campaign:", error);
      res.status(500).json({ error: "Failed to join campaign" });
    }
  },
);

// =============================================================================
// BOOSTS API
// =============================================================================

router.get("/boost-options", async (req, res) => {
  try {
    const boostOptions = [
      {
        id: "boost1",
        name: "24-Hour Basic Boost",
        duration: 24,
        price: 5,
        description: "Boost your product visibility for 24 hours",
        boostType: "basic",
        currency: "SOFT_POINTS",
        features: ['Appears in "Boosted" section', "Higher search ranking"],
      },
      {
        id: "boost2",
        name: "3-Day Featured Boost",
        duration: 72,
        price: 15,
        description: "Feature your product for 3 days",
        boostType: "featured",
        currency: "SOFT_POINTS",
        features: [
          "Featured products section",
          "Category page highlight",
          "Email newsletter inclusion",
        ],
        popular: true,
      },
      {
        id: "boost3",
        name: "7-Day Premium Boost",
        duration: 168,
        price: 35,
        description: "Maximum visibility for a full week",
        boostType: "premium",
        currency: "SOFT_POINTS",
        features: [
          "Homepage banner",
          "Top search results",
          "Social media promotion",
          "Email campaigns",
        ],
      },
      {
        id: "boost4",
        name: "Homepage Spotlight",
        duration: 24,
        price: 50,
        description: "Premium homepage placement for 24 hours",
        boostType: "homepage",
        currency: "USDT",
        features: [
          "Homepage hero section",
          "Maximum exposure",
          "Priority support",
        ],
      },
    ];

    res.json(boostOptions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch boost options" });
  }
});

// Create product boost
router.post(
  "/products/:productId/boost",
  authenticateToken,
  async (req, res) => {
    try {
      const { boostOptionId } = req.body;

      // Verify product ownership
      const product = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.id, req.params.productId),
            eq(products.sellerId, req.user.id),
          ),
        )
        .limit(1);

      if (!product[0]) {
        return res
          .status(404)
          .json({ error: "Product not found or unauthorized" });
      }

      // Get boost option details (in real app, this would come from database)
      const boostOptions = {
        boost1: {
          type: "basic",
          duration: 24,
          cost: 5,
          currency: "SOFT_POINTS",
        },
        boost2: {
          type: "featured",
          duration: 72,
          cost: 15,
          currency: "SOFT_POINTS",
        },
        boost3: {
          type: "premium",
          duration: 168,
          cost: 35,
          currency: "SOFT_POINTS",
        },
        boost4: { type: "homepage", duration: 24, cost: 50, currency: "USDT" },
      };

      const boostOption =
        boostOptions[boostOptionId as keyof typeof boostOptions];
      if (!boostOption) {
        return res.status(400).json({ error: "Invalid boost option" });
      }

      // Create boost record
      const [boost] = await db
        .insert(productBoosts)
        .values({
          productId: req.params.productId,
          userId: req.user.id,
          boostType: boostOption.type,
          duration: boostOption.duration,
          cost: boostOption.cost,
          currency: boostOption.currency,
          paymentMethod: "wallet",
          status: "active",
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + boostOption.duration * 60 * 60 * 1000,
          ).toISOString(),
          requiresApproval: false,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          conversionValue: 0,
        })
        .returning();

      // Update product boost level
      const boostLevel =
        boostOption.type === "basic"
          ? 1
          : boostOption.type === "featured"
            ? 2
            : boostOption.type === "premium"
              ? 3
              : 4;

      await db
        .update(products)
        .set({
          boostLevel,
          boostedUntil: boost.endDate,
          isSponsored: true,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(products.id, req.params.productId));

      res.status(201).json(boost);
    } catch (error) {
      console.error("Error creating boost:", error);
      res.status(500).json({ error: "Failed to create boost" });
    }
  },
);

// Get user's boosts
router.get("/my-boosts", authenticateToken, async (req, res) => {
  try {
    const boosts = await db
      .select()
      .from(productBoosts)
      .where(eq(productBoosts.userId, req.user.id))
      .orderBy(desc(productBoosts.createdAt));

    res.json(boosts);
  } catch (error) {
    console.error("Error fetching boosts:", error);
    res.status(500).json({ error: "Failed to fetch boosts" });
  }
});

// =============================================================================
// CART API
// =============================================================================

router.get("/cart", authenticateToken, async (req, res) => {
  try {
    // Get or create cart
    let [cart] = await db
      .select()
      .from(shoppingCarts)
      .where(eq(shoppingCarts.userId, req.user.id))
      .limit(1);

    if (!cart) {
      [cart] = await db
        .insert(shoppingCarts)
        .values({
          userId: req.user.id,
        })
        .returning();
    }

    // Get cart items with product details
    const items = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        variantId: cartItems.variantId,
        quantity: cartItems.quantity,
        priceSnapshot: cartItems.priceSnapshot,
        customOptions: cartItems.customOptions,
        notes: cartItems.notes,
        addedAt: cartItems.addedAt,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          discountPrice: products.discountPrice,
          image: products.images,
          inStock: products.inStock,
          sellerId: products.sellerId,
        },
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cart.id));

    res.json({ cart, items });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Add item to cart
router.post("/cart/items", authenticateToken, async (req, res) => {
  try {
    const {
      productId,
      variantId,
      quantity = 1,
      customOptions,
      notes,
    } = req.body;

    // Get or create cart
    let [cart] = await db
      .select()
      .from(shoppingCarts)
      .where(eq(shoppingCarts.userId, req.user.id))
      .limit(1);

    if (!cart) {
      [cart] = await db
        .insert(shoppingCarts)
        .values({
          userId: req.user.id,
        })
        .returning();
    }

    // Get product to capture price
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (!product.inStock) {
      return res.status(400).json({ error: "Product is out of stock" });
    }

    const priceSnapshot = product.discountPrice || product.price;

    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId),
          variantId
            ? eq(cartItems.variantId, variantId)
            : sql`${cartItems.variantId} IS NULL`,
        ),
      )
      .limit(1);

    let item;
    if (existingItem) {
      // Update quantity
      [item] = await db
        .update(cartItems)
        .set({
          quantity: existingItem.quantity + quantity,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
    } else {
      // Add new item
      [item] = await db
        .insert(cartItems)
        .values({
          cartId: cart.id,
          productId,
          variantId,
          quantity,
          priceSnapshot,
          customOptions,
          notes,
        })
        .returning();
    }

    res.status(201).json(item);
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// Update cart item
router.put("/cart/items/:itemId", authenticateToken, async (req, res) => {
  try {
    const { quantity, notes } = req.body;

    // Verify ownership through cart
    const [item] = await db
      .select({
        cartItem: cartItems,
        cart: shoppingCarts,
      })
      .from(cartItems)
      .innerJoin(shoppingCarts, eq(cartItems.cartId, shoppingCarts.id))
      .where(
        and(
          eq(cartItems.id, req.params.itemId),
          eq(shoppingCarts.userId, req.user.id),
        ),
      )
      .limit(1);

    if (!item) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    const [updatedItem] = await db
      .update(cartItems)
      .set({
        quantity,
        notes,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(cartItems.id, req.params.itemId))
      .returning();

    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ error: "Failed to update cart item" });
  }
});

// Remove cart item
router.delete("/cart/items/:itemId", authenticateToken, async (req, res) => {
  try {
    // Verify ownership through cart
    const [item] = await db
      .select({
        cartItem: cartItems,
        cart: shoppingCarts,
      })
      .from(cartItems)
      .innerJoin(shoppingCarts, eq(cartItems.cartId, shoppingCarts.id))
      .where(
        and(
          eq(cartItems.id, req.params.itemId),
          eq(shoppingCarts.userId, req.user.id),
        ),
      )
      .limit(1);

    if (!item) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await db.delete(cartItems).where(eq(cartItems.id, req.params.itemId));

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ error: "Failed to remove cart item" });
  }
});

// =============================================================================
// ORDERS API
// =============================================================================

// Get user's orders
router.get("/orders", authenticateToken, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    let query = db
      .select()
      .from(marketplaceOrders)
      .where(eq(marketplaceOrders.buyerId, req.user.id))
      .orderBy(desc(marketplaceOrders.createdAt));

    if (status) {
      query = query.where(
        and(
          eq(marketplaceOrders.buyerId, req.user.id),
          eq(marketplaceOrders.status, status as string),
        ),
      );
    }

    const orders = await query
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Create order (checkout)
router.post("/orders", authenticateToken, async (req, res) => {
  try {
    const {
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentCurrency = "USDT",
      promoCode,
    } = req.body;

    // Get user's cart
    const [cart] = await db
      .select()
      .from(shoppingCarts)
      .where(eq(shoppingCarts.userId, req.user.id))
      .limit(1);

    if (!cart) {
      return res.status(400).json({ error: "Cart not found" });
    }

    // Get cart items
    const items = await db
      .select({
        cartItem: cartItems,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cart.id));

    if (items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.cartItem.priceSnapshot * item.cartItem.quantity,
      0,
    );
    const shippingCost = 0; // Calculate based on items and address
    const taxAmount = subtotal * 0.08; // 8% tax
    const discountAmount = 0; // Apply promo code if provided
    const total = subtotal + shippingCost + taxAmount - discountAmount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const orderItems = items.map((item) => ({
      productId: item.cartItem.productId,
      variantId: item.cartItem.variantId,
      productName: item.product.name,
      productImage: Array.isArray(item.product.images)
        ? item.product.images[0]
        : item.product.images,
      sellerId: item.product.sellerId,
      sellerName: "Seller", // Get from seller profile
      quantity: item.cartItem.quantity,
      unitPrice: item.cartItem.priceSnapshot,
      totalPrice: item.cartItem.priceSnapshot * item.cartItem.quantity,
      status: "pending",
    }));

    const [order] = await db
      .insert(marketplaceOrders)
      .values({
        buyerId: req.user.id,
        sellerId: items[0].product.sellerId, // For single seller orders
        customerName: req.user.email || "Customer",
        customerEmail: req.user.email || "",
        orderNumber,
        orderType: "marketplace",
        items: orderItems,
        subtotal,
        shippingCost,
        taxAmount,
        discountAmount,
        discountCode: promoCode,
        totalAmount: total,
        paymentMethod,
        paymentCurrency,
        paymentStatus: "pending",
        shippingAddress,
        billingAddress,
        status: "pending",
        fulfillmentStatus: "pending",
        requiresShipping: true,
        autoCompleteAfterDays: 7,
        platformFee: total * 0.05,
        feePercentage: 5.0,
        returnRequested: false,
        downloadCount: 0,
      })
      .returning();

    // Clear cart
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    // Create order status log
    await db.insert(orderStatusLogs).values({
      orderId: order.id,
      fromStatus: null,
      toStatus: "pending",
      reason: "Order created",
      changedBy: req.user.id,
      changedByType: "buyer",
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Update order status
router.put("/orders/:orderId/status", authenticateToken, async (req, res) => {
  try {
    const { status, notes } = req.body;

    // Verify order exists and user has permission
    const [order] = await db
      .select()
      .from(marketplaceOrders)
      .where(
        and(
          eq(marketplaceOrders.id, req.params.orderId),
          eq(marketplaceOrders.buyerId, req.user.id),
        ),
      )
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update order
    const updateData: any = { status, updatedAt: new Date().toISOString() };

    if (status === "delivered") {
      updateData.deliveredAt = new Date().toISOString();
    } else if (status === "completed") {
      updateData.completedAt = new Date().toISOString();
    }

    const [updatedOrder] = await db
      .update(marketplaceOrders)
      .set(updateData)
      .where(eq(marketplaceOrders.id, req.params.orderId))
      .returning();

    // Create status log
    await db.insert(orderStatusLogs).values({
      orderId: req.params.orderId,
      fromStatus: order.status,
      toStatus: status,
      reason: notes || "Status updated by buyer",
      changedBy: req.user.id,
      changedByType: "buyer",
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// =============================================================================
// REVIEWS API
// =============================================================================

// Get product reviews
router.get("/products/:productId/reviews", async (req, res) => {
  try {
    const { limit = 10, offset = 0, sortBy = "recent" } = req.query;

    let query = db
      .select()
      .from(marketplaceReviews)
      .where(eq(marketplaceReviews.productId, req.params.productId));

    // Apply sorting
    switch (sortBy) {
      case "rating-high":
        query = query.orderBy(desc(marketplaceReviews.overallRating));
        break;
      case "rating-low":
        query = query.orderBy(asc(marketplaceReviews.overallRating));
        break;
      case "helpful":
        query = query.orderBy(desc(marketplaceReviews.helpfulVotes));
        break;
      case "recent":
      default:
        query = query.orderBy(desc(marketplaceReviews.createdAt));
        break;
    }

    const reviews = await query
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Create review
router.post(
  "/products/:productId/reviews",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        orderId,
        overallRating,
        qualityRating,
        valueRating,
        shippingRating,
        serviceRating,
        title,
        comment,
        pros,
        cons,
        images,
        wouldRecommend,
      } = req.body;

      // Verify user purchased the product
      const [order] = await db
        .select()
        .from(marketplaceOrders)
        .where(
          and(
            eq(marketplaceOrders.id, orderId),
            eq(marketplaceOrders.buyerId, req.user.id),
            eq(marketplaceOrders.status, "completed"),
          ),
        )
        .limit(1);

      if (!order) {
        return res
          .status(400)
          .json({ error: "You can only review products you have purchased" });
      }

      // Check if already reviewed
      const [existingReview] = await db
        .select()
        .from(marketplaceReviews)
        .where(
          and(
            eq(marketplaceReviews.orderId, orderId),
            eq(marketplaceReviews.productId, req.params.productId),
            eq(marketplaceReviews.reviewerId, req.user.id),
          ),
        )
        .limit(1);

      if (existingReview) {
        return res
          .status(400)
          .json({ error: "You have already reviewed this product" });
      }

      const [review] = await db
        .insert(marketplaceReviews)
        .values({
          orderId,
          productId: req.params.productId,
          reviewerId: req.user.id,
          sellerId: order.sellerId,
          overallRating,
          qualityRating,
          valueRating,
          shippingRating,
          serviceRating,
          title,
          comment,
          pros,
          cons,
          images,
          wouldRecommend,
          isVerifiedPurchase: true,
          moderationStatus: "approved",
          helpfulVotes: 0,
          totalVotes: 0,
          reportCount: 0,
          helpfulnessScore: 0,
          qualityScore: 0,
          rewardEarned: 0,
        })
        .returning();

      // Update product rating
      const allReviews = await db
        .select()
        .from(marketplaceReviews)
        .where(eq(marketplaceReviews.productId, req.params.productId));

      const avgRating =
        allReviews.reduce((sum, r) => sum + r.overallRating, 0) /
        allReviews.length;

      await db
        .update(products)
        .set({
          averageRating: parseFloat(avgRating.toFixed(1)),
          totalReviews: allReviews.length,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(products.id, req.params.productId));

      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  },
);

// =============================================================================
// ANALYTICS API
// =============================================================================

// Get seller analytics
router.get("/seller/analytics", authenticateToken, async (req, res) => {
  try {
    const { period = "monthly" } = req.query;

    // In a real implementation, this would query actual analytics data
    const analytics = {
      totalRevenue: 12450.67,
      totalOrders: 89,
      totalProducts: 15,
      conversionRate: 3.2,
      averageOrderValue: 139.9,
      responseRate: 98,
      onTimeDeliveryRate: 95,
      customerSatisfaction: 4.8,
      boostROI: 245,
      monthlyRevenue: [8500, 9200, 11800, 12450],
      categoryBreakdown: [
        { category: "Electronics", revenue: 7500, percentage: 60 },
        { category: "Fashion", revenue: 3000, percentage: 24 },
        { category: "Home", revenue: 1950, percentage: 16 },
      ],
    };

    res.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// =============================================================================
// WISHLIST API
// =============================================================================

// Get user's wishlists
router.get("/wishlists", authenticateToken, async (req, res) => {
  try {
    const userWishlists = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, req.user.id))
      .orderBy(desc(wishlists.createdAt));

    res.json(userWishlists);
  } catch (error) {
    console.error("Error fetching wishlists:", error);
    res.status(500).json({ error: "Failed to fetch wishlists" });
  }
});

// Create new wishlist
router.post("/wishlists", authenticateToken, async (req, res) => {
  try {
    const { name, description, isPublic = false } = req.body;

    const [wishlist] = await db
      .insert(wishlists)
      .values({
        userId: req.user.id,
        name,
        description,
        isPublic,
        itemCount: 0,
      })
      .returning();

    res.status(201).json(wishlist);
  } catch (error) {
    console.error("Error creating wishlist:", error);
    res.status(500).json({ error: "Failed to create wishlist" });
  }
});

// Get wishlist items
router.get(
  "/wishlists/:wishlistId/items",
  authenticateToken,
  async (req, res) => {
    try {
      // Verify ownership
      const [wishlist] = await db
        .select()
        .from(wishlists)
        .where(
          and(
            eq(wishlists.id, req.params.wishlistId),
            eq(wishlists.userId, req.user.id),
          ),
        )
        .limit(1);

      if (!wishlist) {
        return res.status(404).json({ error: "Wishlist not found" });
      }

      // Get wishlist items with product details
      const items = await db
        .select({
          id: wishlistItems.id,
          wishlistId: wishlistItems.wishlistId,
          productId: wishlistItems.productId,
          addedAt: wishlistItems.addedAt,
          priority: wishlistItems.priority,
          targetPrice: wishlistItems.targetPrice,
          notes: wishlistItems.notes,
          notifyOnSale: wishlistItems.notifyOnSale,
          notifyOnRestock: wishlistItems.notifyOnRestock,
          product: {
            id: products.id,
            name: products.name,
            description: products.description,
            price: products.price,
            discountPrice: products.discountPrice,
            images: products.images,
            inStock: products.inStock,
            averageRating: products.averageRating,
            totalReviews: products.totalReviews,
          },
        })
        .from(wishlistItems)
        .innerJoin(products, eq(wishlistItems.productId, products.id))
        .where(eq(wishlistItems.wishlistId, req.params.wishlistId))
        .orderBy(desc(wishlistItems.addedAt));

      res.json(items);
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      res.status(500).json({ error: "Failed to fetch wishlist items" });
    }
  },
);

// Add item to wishlist
router.post(
  "/wishlists/:wishlistId/items",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        productId,
        priority = "medium",
        targetPrice,
        notes,
        notifyOnSale = true,
        notifyOnRestock = true,
      } = req.body;

      // Verify wishlist ownership
      const [wishlist] = await db
        .select()
        .from(wishlists)
        .where(
          and(
            eq(wishlists.id, req.params.wishlistId),
            eq(wishlists.userId, req.user.id),
          ),
        )
        .limit(1);

      if (!wishlist) {
        return res.status(404).json({ error: "Wishlist not found" });
      }

      // Check if product exists
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Check if already in wishlist
      const [existingItem] = await db
        .select()
        .from(wishlistItems)
        .where(
          and(
            eq(wishlistItems.wishlistId, req.params.wishlistId),
            eq(wishlistItems.productId, productId),
          ),
        )
        .limit(1);

      if (existingItem) {
        return res.status(400).json({ error: "Product already in wishlist" });
      }

      const [item] = await db
        .insert(wishlistItems)
        .values({
          wishlistId: req.params.wishlistId,
          productId,
          priority,
          targetPrice,
          notes,
          notifyOnSale,
          notifyOnRestock,
        })
        .returning();

      // Update wishlist item count
      await db
        .update(wishlists)
        .set({
          itemCount: sql`${wishlists.itemCount} + 1`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(wishlists.id, req.params.wishlistId));

      res.status(201).json(item);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ error: "Failed to add to wishlist" });
    }
  },
);

// Remove item from wishlist
router.delete(
  "/wishlists/:wishlistId/items/:itemId",
  authenticateToken,
  async (req, res) => {
    try {
      // Verify ownership through wishlist
      const [item] = await db
        .select({
          wishlistItem: wishlistItems,
          wishlist: wishlists,
        })
        .from(wishlistItems)
        .innerJoin(wishlists, eq(wishlistItems.wishlistId, wishlists.id))
        .where(
          and(
            eq(wishlistItems.id, req.params.itemId),
            eq(wishlists.userId, req.user.id),
          ),
        )
        .limit(1);

      if (!item) {
        return res.status(404).json({ error: "Wishlist item not found" });
      }

      await db
        .delete(wishlistItems)
        .where(eq(wishlistItems.id, req.params.itemId));

      // Update wishlist item count
      await db
        .update(wishlists)
        .set({
          itemCount: sql`${wishlists.itemCount} - 1`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(wishlists.id, req.params.wishlistId));

      res.json({ message: "Item removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ error: "Failed to remove from wishlist" });
    }
  },
);

// =============================================================================
// DISPUTES API
// =============================================================================

// Get user's disputes
router.get("/disputes", authenticateToken, async (req, res) => {
  try {
    const { status, type, limit = 20, offset = 0 } = req.query;

    let query = db
      .select()
      .from(marketplaceDisputes)
      .where(
        sql`${marketplaceDisputes.buyerId} = ${req.user.id} OR ${marketplaceDisputes.sellerId} = ${req.user.id}`,
      )
      .orderBy(desc(marketplaceDisputes.createdAt));

    const conditions = [];
    if (status)
      conditions.push(eq(marketplaceDisputes.status, status as string));
    if (type)
      conditions.push(eq(marketplaceDisputes.disputeType, type as string));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const disputes = await query
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json(disputes);
  } catch (error) {
    console.error("Error fetching disputes:", error);
    res.status(500).json({ error: "Failed to fetch disputes" });
  }
});

// Create dispute
router.post("/disputes", authenticateToken, async (req, res) => {
  try {
    const {
      orderId,
      disputeType,
      reason,
      description,
      evidenceUrls = [],
      requestedResolution,
      requestedAmount,
    } = req.body;

    // Verify order ownership
    const [order] = await db
      .select()
      .from(marketplaceOrders)
      .where(
        and(
          eq(marketplaceOrders.id, orderId),
          eq(marketplaceOrders.buyerId, req.user.id),
        ),
      )
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Order not found or unauthorized" });
    }

    // Check if dispute already exists
    const [existingDispute] = await db
      .select()
      .from(marketplaceDisputes)
      .where(eq(marketplaceDisputes.orderId, orderId))
      .limit(1);

    if (existingDispute) {
      return res
        .status(400)
        .json({ error: "Dispute already exists for this order" });
    }

    const [dispute] = await db
      .insert(marketplaceDisputes)
      .values({
        orderId,
        buyerId: req.user.id,
        sellerId: order.sellerId,
        disputeType,
        reason,
        description,
        evidenceUrls,
        requestedResolution,
        requestedAmount,
        status: "open",
        adminAssignedTo: null,
        buyerLastResponse: new Date().toISOString(),
        sellerLastResponse: null,
        adminLastResponse: null,
        escalatedAt: null,
        resolutionOfferedAt: null,
        agreedResolutionAt: null,
        finalDecisionAt: null,
        refundProcessedAt: null,
        buyerSatisfaction: null,
        sellerSatisfaction: null,
      })
      .returning();

    res.status(201).json(dispute);
  } catch (error) {
    console.error("Error creating dispute:", error);
    res.status(500).json({ error: "Failed to create dispute" });
  }
});

// Update dispute
router.put("/disputes/:disputeId", authenticateToken, async (req, res) => {
  try {
    const { status, response, evidenceUrls } = req.body;

    // Verify dispute involvement
    const [dispute] = await db
      .select()
      .from(marketplaceDisputes)
      .where(
        and(
          eq(marketplaceDisputes.id, req.params.disputeId),
          sql`${marketplaceDisputes.buyerId} = ${req.user.id} OR ${marketplaceDisputes.sellerId} = ${req.user.id}`,
        ),
      )
      .limit(1);

    if (!dispute) {
      return res
        .status(404)
        .json({ error: "Dispute not found or unauthorized" });
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (response) {
      updateData.messages = sql`${marketplaceDisputes.messages} || ${JSON.stringify(
        [
          {
            from: req.user.id,
            message: response,
            timestamp: new Date().toISOString(),
            evidenceUrls: evidenceUrls || [],
          },
        ],
      )}`;

      // Update last response timestamp
      if (dispute.buyerId === req.user.id) {
        updateData.buyerLastResponse = new Date().toISOString();
      } else {
        updateData.sellerLastResponse = new Date().toISOString();
      }
    }

    const [updatedDispute] = await db
      .update(marketplaceDisputes)
      .set(updateData)
      .where(eq(marketplaceDisputes.id, req.params.disputeId))
      .returning();

    res.json(updatedDispute);
  } catch (error) {
    console.error("Error updating dispute:", error);
    res.status(500).json({ error: "Failed to update dispute" });
  }
});

// =============================================================================
// PRODUCT PRICE HISTORY API
// =============================================================================

// Get product price history
router.get("/products/:productId/price-history", async (req, res) => {
  try {
    const { period = "6m" } = req.query;

    let dateFilter = new Date();
    switch (period) {
      case "1m":
        dateFilter.setMonth(dateFilter.getMonth() - 1);
        break;
      case "3m":
        dateFilter.setMonth(dateFilter.getMonth() - 3);
        break;
      case "6m":
        dateFilter.setMonth(dateFilter.getMonth() - 6);
        break;
      case "1y":
        dateFilter.setFullYear(dateFilter.getFullYear() - 1);
        break;
      default:
        dateFilter.setMonth(dateFilter.getMonth() - 6);
    }

    const priceHistory = await db
      .select()
      .from(productPriceHistory)
      .where(
        and(
          eq(productPriceHistory.productId, req.params.productId),
          gte(productPriceHistory.createdAt, dateFilter.toISOString()),
        ),
      )
      .orderBy(asc(productPriceHistory.createdAt));

    res.json(priceHistory);
  } catch (error) {
    console.error("Error fetching price history:", error);
    res.status(500).json({ error: "Failed to fetch price history" });
  }
});

// =============================================================================
// PRODUCT RECOMMENDATIONS API
// =============================================================================

// Get product recommendations
router.get("/products/:productId/recommendations", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recommendations = await db
      .select({
        recommendedProduct: products,
        score: productRecommendations.score,
        reason: productRecommendations.reason,
      })
      .from(productRecommendations)
      .innerJoin(
        products,
        eq(productRecommendations.recommendedProductId, products.id),
      )
      .where(eq(productRecommendations.productId, req.params.productId))
      .orderBy(desc(productRecommendations.score))
      .limit(parseInt(limit as string));

    res.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

// =============================================================================
// SEARCH API
// =============================================================================

// Advanced search
router.post("/search", async (req, res) => {
  try {
    const {
      query: searchQuery,
      filters = {},
      sortBy = "relevance",
      page = 1,
      limit = 20,
    } = req.body;

    let query = db.select().from(products);
    const conditions = [];

    // Search query
    if (searchQuery) {
      conditions.push(
        sql`(
          ${products.name} ILIKE ${"%" + searchQuery + "%"} OR
          ${products.description} ILIKE ${"%" + searchQuery + "%"} OR
          ${products.tags} ILIKE ${"%" + searchQuery + "%"}
        )`,
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        switch (key) {
          case "category":
            conditions.push(eq(products.category, value as string));
            break;
          case "minPrice":
            conditions.push(gte(products.price, parseFloat(value as string)));
            break;
          case "maxPrice":
            conditions.push(lte(products.price, parseFloat(value as string)));
            break;
          case "rating":
            conditions.push(
              gte(products.averageRating, parseFloat(value as string)),
            );
            break;
          case "inStock":
            conditions.push(eq(products.inStock, value as boolean));
            break;
          case "productType":
            conditions.push(eq(products.productType, value as string));
            break;
        }
      }
    });

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        query = query.orderBy(asc(products.price));
        break;
      case "price-high":
        query = query.orderBy(desc(products.price));
        break;
      case "rating":
        query = query.orderBy(desc(products.averageRating));
        break;
      case "popular":
        query = query.orderBy(desc(products.totalSales));
        break;
      case "recent":
        query = query.orderBy(desc(products.createdAt));
        break;
      case "relevance":
      default:
        // For relevance, we'd typically use full-text search scoring
        query = query.orderBy(
          desc(products.boostLevel),
          desc(products.totalSales),
        );
        break;
    }

    // Apply pagination
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    query = query.limit(parseInt(limit as string)).offset(offset);

    const results = await query;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    const total = totalResult[0]?.count || 0;

    res.json({
      results,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
      searchQuery,
      appliedFilters: filters,
    });
  } catch (error) {
    console.error("Error performing search:", error);
    res.status(500).json({ error: "Failed to perform search" });
  }
});

// =============================================================================
// ADMIN ROUTES (for managing marketplace)
// =============================================================================

// Approve/reject campaign participation
router.put(
  "/admin/campaigns/:campaignId/products/:productId",
  validateAdmin,
  async (req, res) => {
    try {
      const { status, featuredOrder = 0 } = req.body;

      const [participation] = await db
        .update(campaignProducts)
        .set({
          status,
          featuredOrder,
          approvedAt: status === "approved" ? new Date().toISOString() : null,
          approvedBy: status === "approved" ? req.user.id : null,
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(campaignProducts.campaignId, req.params.campaignId),
            eq(campaignProducts.productId, req.params.productId),
          ),
        )
        .returning();

      if (!participation) {
        return res
          .status(404)
          .json({ error: "Campaign participation not found" });
      }

      res.json(participation);
    } catch (error) {
      console.error("Error updating campaign participation:", error);
      res
        .status(500)
        .json({ error: "Failed to update campaign participation" });
    }
  },
);

// Get pending campaign requests
router.get("/admin/campaigns/pending", validateAdmin, async (req, res) => {
  try {
    const pendingRequests = await db
      .select({
        campaignProduct: campaignProducts,
        campaign: campaigns,
        product: products,
      })
      .from(campaignProducts)
      .innerJoin(campaigns, eq(campaignProducts.campaignId, campaigns.id))
      .innerJoin(products, eq(campaignProducts.productId, products.id))
      .where(eq(campaignProducts.status, "pending"))
      .orderBy(desc(campaignProducts.createdAt));

    res.json(pendingRequests);
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
});

export default router;
