// ==========================================
// SWASRA COLLECTIONS
// Website JavaScript
// ==========================================

const whatsappNumber = "917075848073";
const websiteUrl =
    "https://swa-sra-collections.vercel.app/";

// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "SwaSra Collections website loaded successfully."
        );

        await loadProductsFromSupabase();

        renderProducts();

        initializeProductFilters();

        openProductFromUrl();

    }
);

// ==========================================
// LOAD PRODUCTS FROM SUPABASE
// ==========================================

async function loadProductsFromSupabase() {

    try {

        const { data, error } =
            await supabaseClient
                .from("products")
                .select(`
                    id,
                    code,
                    name,
                    price,
                    original_price,
                    category,
                    badge,
                    fabric,
                    occasion,
                    availability,
                    description,
                    created_at,
                    product_colours (
                        name,
                        image_url,
                        availability,
                        created_at
                    )
                `)
                .order(
                    "code",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "Unable to load products from Supabase:",
                error
            );

            console.log(
                "Using products.js as backup."
            );

            return;

        }


        if (
            !data ||
            data.length === 0
        ) {

            console.warn(
                "No products found in Supabase. Using products.js as backup."
            );

            return;

        }


        products =
            data.map(
                function (product) {

                    const colours =
                        (
                            product.product_colours ||
                            []
                        )
                            .sort(
                                function (a, b) {

                                    return (
                                        new Date(a.created_at) -
                                        new Date(b.created_at)
                                    );

                                }
                            )
                            .map(
                                function (colour) {

                                    return {

                                        name:
                                            colour.name,

                                        image:
                                            colour.image_url,

                                        availability:
                                            colour.availability ||
                                            "In Stock"

                                    };

                                }
                            );


                    return {

                        code:
                            product.code,

                        name:
                            product.name,

                        price:
                            product.price,

                        originalPrice:
                            product.original_price ||
                            "",

                        category:
                            product.category,

                        badge:
                            product.badge ||
                            "",

                        fabric:
                            product.fabric ||
                            "",

                        occasion:
                            product.occasion ||
                            "",

                        availability:
                            product.availability ||
                            "In Stock",

                        description:
                            product.description ||
                            "",

                        colours:
                            colours

                    };

                }
            );


        console.log(
            "Products loaded from Supabase:",
            products
        );

    } catch (error) {

        console.error(
            "Unexpected Supabase error:",
            error
        );

        console.log(
            "Using products.js as backup."
        );

    }

}
// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts(productList = products) {

    const productGrid =
        document.getElementById("productGrid");


    // Safety check
    if (!productGrid) {

        console.error(
            "Product grid not found. Check id='productGrid' in index.html."
        );

        return;
    }


    productGrid.innerHTML = "";


    // ==========================================
    // NO PRODUCTS FOUND
    // ==========================================

    if (productList.length === 0) {

        productGrid.innerHTML = `

            <div class="no-products">

                <p>
                    No sarees found.
                </p>

            </div>

        `;

        return;
    }


    // ==========================================
    // CREATE PRODUCT CARDS
    // ==========================================

    productList.forEach(
        function (product) {

            const firstColour =
                product.colours &&
                product.colours.length > 0
                    ? product.colours[0]
                    : null;


            const productCard =
                document.createElement("div");


            productCard.className =
                "product-card";


            productCard.dataset.category =
                product.category;


            productCard.dataset.code =
                product.code;


            // ==========================================
            // ORIGINAL PRICE
            // ==========================================

            const originalPriceHTML =
                product.originalPrice
                    ? `
                        <p class="original-price">
                            ${product.originalPrice}
                        </p>
                    `
                    : "";


            // ==========================================
            // COLOUR THUMBNAILS
            // ==========================================

            const colourPreviewHTML =
                product.colours &&
                product.colours.length > 0
                    ? product.colours
                        .map(
                            function (
                                colour,
                                index
                            ) {

                                return `

                                    <button
                                        class="product-colour-thumb ${
                                            index === 0
                                                ? "active"
                                                : ""
                                        }"
                                        type="button"
                                        title="${colour.name}"
                                        onclick="changeCardImage(
                                            this,
                                            '${colour.image}',
                                            '${colour.name}'
                                        )"
                                    >

                                        <img
                                            src="${colour.image}"
                                            alt="${colour.name} Saree"
                                        >

                                    </button>

                                `;

                            }
                        )
                        .join("")
                    : "";


            // ==========================================
            // PRODUCT IMAGE
            // ==========================================

            const productImage =
                firstColour
                    ? firstColour.image
                    : "";


            // ==========================================
            // PRODUCT CARD HTML
            // ==========================================

            productCard.innerHTML = `

                <div class="product-photo">

                    ${
                        product.badge
                            ? `
                                <span class="product-badge">
                                    ${product.badge}
                                </span>
                            `
                            : ""
                    }

                    <img
                        src="${productImage}"
                        alt="${product.name}"
                        class="product-img"
                    >

                </div>


                <div class="product-info">

                    <p class="product-code">
                        ${product.code}
                    </p>


                    <h3>
                        ${product.name}
                    </h3>


                    <p class="product-description">
                        ${product.description}
                    </p>


                    <p class="colour-count">

                        ${
                            product.colours
                                ? product.colours.length
                                : 0
                        }

                        Colours Available

                    </p>


                    <div class="product-colour-preview">

                        ${colourPreviewHTML}

                    </div>


                    <div class="product-bottom">

                        <div class="price-wrap">

                            ${originalPriceHTML}

                            <p class="price">
                                ${product.price}
                            </p>

                        </div>


                        <p class="availability">

                            ${
                                product.availability ||
                                "Contact for availability"
                            }

                        </p>

                    </div>


                    <div class="product-actions">

                        <button
                            class="view-btn"
                            type="button"
                            onclick="openProductModalByCode(
                                '${product.code}'
                            )"
                        >

                            View Details

                        </button>


                        <a
                            href="${createProductWhatsappLink(
                                product
                            )}"
                            class="order-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                        >

                            Order on WhatsApp

                        </a>

                    </div>

                </div>

            `;


            productGrid.appendChild(
                productCard
            );

        }
    );

}


// ==========================================
// CHANGE IMAGE ON PRODUCT CARD
// ==========================================

function changeCardImage(
    button,
    imagePath,
    colourName
) {

    const productCard =
        button.closest(".product-card");


    if (!productCard) {
        return;
    }


    const productImage =
        productCard.querySelector(
            ".product-img"
        );


    const colourButtons =
        productCard.querySelectorAll(
            ".product-colour-thumb"
        );


    if (productImage) {

        productImage.src =
            imagePath;


        productImage.alt =
            `${colourName} Saree`;

    }


    colourButtons.forEach(
        function (btn) {

            btn.classList.remove(
                "active"
            );

        }
    );


    button.classList.add(
        "active"
    );

}


// ==========================================
// OPEN PRODUCT BY CODE
// ==========================================

function openProductModalByCode(
    code
) {

    const product =
        products.find(
            function (item) {

                return (
                    item.code === code
                );

            }
        );


    if (!product) {

        console.error(
            "Product not found:",
            code
        );

        return;
    }


    openProductModal(

        product.code,

        product.name,

        product.price,

        product.description,

        product.colours,

        product.fabric,

        product.occasion,

        product.availability,

        product.originalPrice

    );

}

// ==========================================
// OPEN PRODUCT FROM URL
// ==========================================

function openProductFromUrl() {

    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    const productCode =
        urlParams.get("product");


    const selectedColor =
        urlParams.get("color");


    if (!productCode) {
        return;
    }


    const product =
        products.find(
            function (item) {

                return (
                    item.code === productCode
                );

            }
        );


    if (!product) {
        return;
    }


    openProductModalByCode(
        productCode
    );


    if (
        selectedColor &&
        product.colours
    ) {

        const matchingColour =
            product.colours.find(
                function (colour) {

                    return (
                        colour.name === selectedColor
                    );

                }
            );


        if (matchingColour) {

            setTimeout(
                function () {

                    const colourButtons =
                        document.querySelectorAll(
                            ".colour-option"
                        );


                    colourButtons.forEach(
                        function (button) {

                            const colourName =
                                button
                                    .querySelector("span")
                                    ?.textContent
                                    .trim();


                            if (
                                colourName === selectedColor
                            ) {

                                button.click();

                            }

                        }
                    );

                },
                50
            );

        }

    }

}
// ==========================================
// PRODUCT WHATSAPP LINK
// ==========================================

function createProductWhatsappLink(product) {

    const productLink =
        `${websiteUrl}?product=${encodeURIComponent(product.code)}`;


    const message =
`Hi SwaSra Collections 👋

I'm interested in this saree.

Product: ${product.name}
Code: ${product.code}
Price: ${product.price}

Product Link:
${productLink}

Please share available colours and ordering details.`;


    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

}


// ==========================================
// OPEN PRODUCT DETAILS MODAL
// ==========================================

function openProductModal(
    code,
    title,
    price,
    description,
    colours,
    fabric,
    occasion,
    availability,
    originalPrice
) {

    const modal =
        document.getElementById(
            "productModal"
        );


    const modalCode =
        document.getElementById(
            "modalCode"
        );


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    const modalPrice =
        document.getElementById(
            "modalPrice"
        );


    const modalDescription =
        document.getElementById(
            "modalDescription"
        );


    const modalFabric =
        document.getElementById(
            "modalFabric"
        );


    const modalOccasion =
        document.getElementById(
            "modalOccasion"
        );


    const modalAvailability =
        document.getElementById(
            "modalAvailability"
        );


    const modalOriginalPrice =
        document.getElementById(
            "modalOriginalPrice"
        );


    const modalProductImage =
        document.getElementById(
            "modalProductImage"
        );


    const whatsappButton =
        document.getElementById(
            "modalWhatsapp"
        );


    const colourOptions =
        document.querySelector(
            ".colour-options"
        );


    // ==========================================
    // SAFETY CHECK
    // ==========================================

    if (
        !modal ||
        !modalCode ||
        !modalTitle ||
        !modalPrice ||
        !modalDescription ||
        !modalProductImage ||
        !whatsappButton ||
        !colourOptions
    ) {

        console.error(
            "Product modal elements are missing in index.html."
        );

        return;
    }


    // ==========================================
    // SET PRODUCT DETAILS
    // ==========================================

    modalCode.textContent =
        code;


    modalTitle.textContent =
        title;


    modalPrice.textContent =
        price;


    modalDescription.textContent =
        description;


    if (modalFabric) {

        modalFabric.textContent =
            fabric ||
            "Not specified";

    }


    if (modalOccasion) {

        modalOccasion.textContent =
            occasion ||
            "Not specified";

    }


    if (modalAvailability) {

        modalAvailability.textContent =
            availability ||
            "Contact for availability";

    }


    // ==========================================
    // ORIGINAL PRICE
    // ==========================================

    if (modalOriginalPrice) {

        if (originalPrice) {

            modalOriginalPrice.textContent =
                originalPrice;


            modalOriginalPrice.style.display =
                "block";

        } else {

            modalOriginalPrice.textContent =
                "";


            modalOriginalPrice.style.display =
                "none";

        }

    }


    // ==========================================
    // CREATE PRODUCT COLOUR OPTIONS
    // ==========================================

    colourOptions.innerHTML =
        "";


    if (
        colours &&
        colours.length > 0
    ) {

        colours.forEach(
            function (
                colour,
                index
            ) {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
    "colour-option";


if (colour.availability === "Sold Out") {

    button.classList.add(
        "sold-out"
    );

}


if (
    index === 0 &&
    colour.availability !== "Sold Out"
) {

    button.classList.add(
        "active"
    );

}


                button.innerHTML = `

                    <img
                        src="${colour.image}"
                        alt="${colour.name} Saree"
                    >

                    <span>
                        ${colour.name}
                    </span>

                `;


                button.addEventListener(
    "click",
    function () {

        if (colour.availability === "Sold Out") {
            return;
        }

        changeProductColour(
            colour.image,
            colour.name,
            button
        );

    }
);


                colourOptions.appendChild(
                    button
                );

            }
        );

    }


    // ==========================================
    // LOAD FIRST COLOUR
    // ==========================================

    if (
        colours &&
        colours.length > 0
    ) {

        modalProductImage.src =
            colours[0].image;


        modalProductImage.alt =
            `${colours[0].name} Saree`;

    }


    // ==========================================
    // DEFAULT WHATSAPP MESSAGE
    // ==========================================

    const firstColour =
        colours &&
        colours.length > 0
            ? colours[0].name
            : "";


    const productLink =
    `${websiteUrl}?product=${encodeURIComponent(code)}`;


const message =
`Hi SwaSra Collections 👋

I'm interested in this saree.

Product: ${title}
Code: ${code}
Colour: ${firstColour}
Price: ${price}

Product Link:
${productLink}

Please share availability and ordering details.`;

    whatsappButton.href =
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            message
        )}`;


    // ==========================================
    // OPEN MODAL
    // ==========================================

    modal.classList.add(
        "active"
    );


    document.body.classList.add(
        "modal-open"
    );

}


// ==========================================
// CHANGE PRODUCT COLOUR IN MODAL
// ==========================================

function changeProductColour(
    imagePath,
    colourName,
    button
) {

    const modalProductImage =
        document.getElementById(
            "modalProductImage"
        );


    const colourButtons =
        document.querySelectorAll(
            ".colour-option"
        );


    if (modalProductImage) {

        modalProductImage.src =
            imagePath;


        modalProductImage.alt =
            `${colourName} Saree`;

    }


    colourButtons.forEach(
        function (btn) {

            btn.classList.remove(
                "active"
            );

        }
    );


    button.classList.add(
        "active"
    );


    updateWhatsappColour(
        colourName
    );

}


// ==========================================
// UPDATE WHATSAPP SELECTED COLOUR
// ==========================================

function updateWhatsappColour(
    colourName
) {

    const modalCode =
        document.getElementById(
            "modalCode"
        );


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    const modalPrice =
        document.getElementById(
            "modalPrice"
        );


    const whatsappButton =
        document.getElementById(
            "modalWhatsapp"
        );


    if (
        !modalCode ||
        !modalTitle ||
        !modalPrice ||
        !whatsappButton
    ) {

        return;

    }


    const code =
        modalCode.textContent;


    const title =
        modalTitle.textContent;


    const price =
        modalPrice.textContent;


   const productLink =
    `${websiteUrl}?product=${encodeURIComponent(code)}&color=${encodeURIComponent(colourName)}`;


const message =
`Hi SwaSra Collections 👋

I'm interested in this saree.

Product: ${title}
Code: ${code}
Colour: ${colourName}
Price: ${price}

Product Link:
${productLink}

Please share availability and ordering details.`;

    whatsappButton.href =
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            message
        )}`;

}


// ==========================================
// CLOSE PRODUCT MODAL
// ==========================================

function closeProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );


    document.body.classList.remove(
        "modal-open"
    );

}


// ==========================================
// CLOSE MODAL USING ESC KEY
// ==========================================

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeProductModal();

        }

    }
);


// ==========================================
// SEARCH & CATEGORY FILTER
// ==========================================

function initializeProductFilters() {

    const searchInput =
        document.getElementById(
            "productSearch"
        );


    const filterButtons =
        document.querySelectorAll(
            ".filter-btn"
        );


    let activeCategory =
        "all";


    // ==========================================
    // FILTER PRODUCTS
    // ==========================================

    function filterProducts() {

        const searchTerm =
            searchInput
                ? searchInput.value
                    .toLowerCase()
                    .trim()
                : "";


        const filteredProducts =
            products.filter(
                function (product) {

                    const matchesCategory =
                        activeCategory ===
                            "all" ||
                        product.category ===
                            activeCategory;


                    const colourNames =
                        product.colours
                            ? product.colours
                                .map(
                                    function (
                                        colour
                                    ) {

                                        return (
                                            colour.name
                                        );

                                    }
                                )
                                .join(" ")
                            : "";


                    const productText =
                        `
                        ${product.code || ""}
                        ${product.name || ""}
                        ${product.description || ""}
                        ${product.category || ""}
                        ${product.fabric || ""}
                        ${product.occasion || ""}
                        ${colourNames}
                        `
                            .toLowerCase();


                    const matchesSearch =
                        productText.includes(
                            searchTerm
                        );


                    return (
                        matchesCategory &&
                        matchesSearch
                    );

                }
            );


        renderProducts(
            filteredProducts
        );

    }


    // ==========================================
    // SEARCH INPUT
    // ==========================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterProducts
        );

    }


    // ==========================================
    // CATEGORY BUTTONS
    // ==========================================

    filterButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    filterButtons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    activeCategory =
                        button.dataset.filter;


                    filterProducts();

                }
            );

        }
    );

}

async function testSupabaseConnection() {

    const { data, error } =
        await supabaseClient
            .from("products")
            .select("*")
            .limit(1);


    if (error) {

        console.error(
            "Supabase connection error:",
            error
        );

        return;
    }


    console.log(
        "Supabase connected successfully:",
        data
    );

}