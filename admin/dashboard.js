// ==========================================
// SWASRA COLLECTIONS
// ADMIN DASHBOARD
// ==========================================


// ==========================================
// PAGE ELEMENTS
// ==========================================

const adminStatus =
    document.getElementById(
        "adminStatus"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


// ==========================================
// CHECK ADMIN LOGIN SESSION
// ==========================================

async function checkAdminSession() {

    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .getSession();


    if (error) {

        console.error(
            "Session check error:",
            error
        );

        window.location.href =
            "./index.html";

        return null;
    }


    const session =
        data.session;


    if (!session) {

        console.log(
            "No admin session found."
        );

        window.location.href =
            "./index.html";

        return null;
    }


    console.log(
        "Admin session confirmed:",
        session.user.email
    );


    if (adminStatus) {

        adminStatus.textContent =
            `Logged in as ${session.user.email}`;

    }


    return session;

}


// ==========================================
// LOGOUT
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            logoutButton.disabled =
                true;

            logoutButton.textContent =
                "Logging out...";


            const {
                error
            } =
                await supabaseClient
                    .auth
                    .signOut();


            if (error) {

                console.error(
                    "Logout error:",
                    error
                );

                logoutButton.disabled =
                    false;

                logoutButton.textContent =
                    "Logout";

                return;
            }


            window.location.href =
                "./index.html";

        }
    );

}


// ==========================================
// LOAD ADMIN PRODUCTS
// ==========================================

async function loadAdminProducts() {

    const adminProductList =
        document.getElementById(
            "adminProductList"
        );

    const totalProducts =
        document.getElementById(
            "totalProducts"
        );

    const totalColours =
        document.getElementById(
            "totalColours"
        );

    const soldOutColours =
        document.getElementById(
            "soldOutColours"
        );

        const soldOutCategoryBreakdown =
    document.getElementById(
        "soldOutCategoryBreakdown"
    );

    const designCategoryBreakdown =
    document.getElementById(
        "designCategoryBreakdown"
    );

const colourCategoryBreakdown =
    document.getElementById(
        "colourCategoryBreakdown"
    );


    if (!adminProductList) {

        console.error(
            "Admin product list element not found."
        );

        return;
    }


    adminProductList.innerHTML =
        "<p>Loading products...</p>";


    const {
        data,
        error
    } =
        await supabaseClient
            .from("products")
            .select(`
                id,
                code,
                name,
                price,
                category,
                availability,
                product_colours (
                    id,
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
            "Unable to load admin products:",
            error
        );


        adminProductList.innerHTML =
            "<p>Unable to load products.</p>";

        return;
    }


    if (!data || data.length === 0) {

        adminProductList.innerHTML =
            "<p>No products found.</p>";


        if (totalProducts) {
            totalProducts.textContent = "0";
        }

        if (totalColours) {
            totalColours.textContent = "0";
        }

        if (soldOutColours) {
            soldOutColours.textContent = "0";
        }

        return;
    }


    // ==========================================
    // REMOVE ANY ACCIDENTAL DUPLICATE PRODUCTS
    // ==========================================

    const uniqueProducts =
        Array.from(
            new Map(
                data.map(
                    function (product) {

                        return [
                            product.id,
                            product
                        ];

                    }
                )
            ).values()
        );


    // ==========================================
    // SUMMARY COUNTS
    // ==========================================

   let colourCount = 0;
let soldOutCount = 0;

const designsByCategory = {};
const coloursByCategory = {};
const soldOutByCategory = {};


    uniqueProducts.forEach(
        function (product) {

            const colours =
                product.product_colours ||
                [];

                const category =
    product.category ||
    "uncategorized";


if (!designsByCategory[category]) {
    designsByCategory[category] = 0;
}

designsByCategory[category] += 1;


if (!coloursByCategory[category]) {
    coloursByCategory[category] = 0;
}

coloursByCategory[category] +=
    colours.length;


            colourCount +=
                colours.length;


            const soldOutColoursForProduct =
    colours.filter(
        function (colour) {

            return (
                colour.availability ===
                "Sold Out"
            );

        }
    );


soldOutCount +=
    soldOutColoursForProduct.length;


if (
    soldOutColoursForProduct.length > 0
) {

    const category =
        product.category ||
        "uncategorized";


    if (!soldOutByCategory[category]) {

        soldOutByCategory[category] = 0;

    }


    soldOutByCategory[category] +=
        soldOutColoursForProduct.length;

}

        }
    );


    if (totalProducts) {

        totalProducts.textContent =
            uniqueProducts.length;

    }


    if (totalColours) {

        totalColours.textContent =
            colourCount;

    }


    if (soldOutColours) {

        soldOutColours.textContent =
            soldOutCount;

    }

    if (soldOutCategoryBreakdown) {

    const categoryNames = {

        silk: "Silk",
        fancy: "Fancy",
        designer: "Designer",
        traditional: "Traditional",
        banarasi: "Banarasi",
        "mysore-silk": "Mysore Silk",
        cotton: "Cotton",
        organza: "Organza",
        georgette: "Georgette",
        kanjeevaram: "Kanjeevaram",
        pattu: "Pattu",
        "party-wear": "Party Wear",
        wedding: "Wedding",
        "daily-wear": "Daily Wear",
        uncategorized: "Other"

    };


    const categoryRows =
        Object.entries(
            soldOutByCategory
        )
            .map(
                function (
                    [category, count]
                ) {

                    const name =
                        categoryNames[
                            category
                        ] ||
                        category
                            .replace(
                                /-/g,
                                " "
                            )
                            .replace(
                                /\b\w/g,
                                function (
                                    letter
                                ) {

                                    return (
                                        letter
                                            .toUpperCase()
                                    );

                                }
                            );


                    return `
                        <div class="soldout-category-row">

                            <span>
                                ${name}
                            </span>

                            <strong>
                                ${count}
                            </strong>

                        </div>
                    `;

                }
            )
            .join("");


    soldOutCategoryBreakdown.innerHTML =
        categoryRows ||
        `
            <p class="soldout-none">
                No sold out colours
            </p>
        `;

}

// ==========================================
// DESIGNS & COLOURS CATEGORY BREAKDOWN
// ==========================================

const summaryCategoryNames = {

    silk: "Silk",
    fancy: "Fancy",
    designer: "Designer",
    traditional: "Traditional",
    banarasi: "Banarasi",
    "mysore-silk": "Mysore Silk",
    cotton: "Cotton",
    organza: "Organza",
    georgette: "Georgette",
    kanjeevaram: "Kanjeevaram",
    pattu: "Pattu",
    "party-wear": "Party Wear",
    wedding: "Wedding",
    "daily-wear": "Daily Wear",
    uncategorized: "Other"

};


function buildSummaryBreakdown(
    categoryData
) {

    return Object.entries(
        categoryData
    )
        .map(
            function (
                [category, count]
            ) {

                const name =
                    summaryCategoryNames[
                        category
                    ] ||
                    category
                        .replace(
                            /-/g,
                            " "
                        )
                        .replace(
                            /\b\w/g,
                            function (
                                letter
                            ) {

                                return (
                                    letter
                                        .toUpperCase()
                                );

                            }
                        );


                return `
                    <div class="summary-category-row">

                        <span>
                            ${name}
                        </span>

                        <strong>
                            ${count}
                        </strong>

                    </div>
                `;

            }
        )
        .join("");

}


if (designCategoryBreakdown) {

    designCategoryBreakdown.innerHTML =
        buildSummaryBreakdown(
            designsByCategory
        );

}


if (colourCategoryBreakdown) {

    colourCategoryBreakdown.innerHTML =
        buildSummaryBreakdown(
            coloursByCategory
        );

}

    // ==========================================
    // CLEAR LOADING MESSAGE
    // ==========================================

    adminProductList.innerHTML =
        "";


    // ==========================================
    // CREATE PRODUCT CARDS
    // ==========================================

    uniqueProducts.forEach(
        function (product) {

            const colours =
                (
                    product.product_colours ||
                    []
                )
                    .sort(
                        function (a, b) {

                            return (
                                new Date(
                                    a.created_at
                                ) -
                                new Date(
                                    b.created_at
                                )
                            );

                        }
                    );


            const firstColour =
                colours.length > 0
                    ? colours[0]
                    : null;


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "admin-product-card";


            // ==========================================
            // COLOUR LIST
            // ==========================================

            const colourRows =
                colours
                    .map(
                        function (colour) {

                            const stockStatus =
                                colour.availability ||
                                "In Stock";


                            return `

    <div class="admin-colour-row">

        <span>
            ${colour.name}
        </span>

        <div class="admin-colour-actions">

            <button
                type="button"
                class="admin-stock-btn"
                data-colour-id="${colour.id}"
                data-status="${stockStatus}"
                onclick="toggleColourStock(
                    '${colour.id}',
                    '${stockStatus}'
                )"
            >
                ${stockStatus}
            </button>

            <button
                type="button"
                class="admin-remove-colour-btn"
                onclick="removeColour(
                    '${colour.id}',
                    '${colour.image_url || ""}',
                    '${colour.name}'
                )"
            >
                Remove
            </button>

        </div>

    </div>

`;
                        }
                    )
                    .join("");


            // ==========================================
            // PRODUCT IMAGE
            // ==========================================

            let productImageHTML =
                `
                    <div>
                        No Image
                    </div>
                `;


            if (
                firstColour &&
                firstColour.image_url
            ) {

                let imagePath =
                    firstColour.image_url;


                if (
                    !imagePath.startsWith(
                        "http"
                    )
                ) {

                    imagePath =
                        `../${imagePath}`;

                }


                productImageHTML = `

                    <img
                        src="${imagePath}"
                        alt="${product.name}"
                    >

                `;

            }


            // ==========================================
            // PRODUCT CARD
            // ==========================================

            card.innerHTML = `

                <div class="admin-product-image">

                    ${productImageHTML}

                </div>


                <div class="admin-product-info">

                    <p class="admin-product-code">
                        ${product.code}
                    </p>


                    <h3>
                        ${product.name}
                    </h3>


                    <p>
                        ${product.price}
                    </p>


                    <p>
                        ${colours.length} Colours
                    </p>


                    <div class="admin-product-colours">

                        ${colourRows}

                    </div>


                    <div class="admin-product-actions">

    <button
        type="button"
        class="admin-edit-btn"
        onclick="openEditProductModal('${product.id}')"
    >
        Edit Product
    </button>

    <button
        type="button"
        class="admin-add-colour-btn"
        onclick="openAddColourModal(
            '${product.id}',
            '${product.code}'
        )"
    >
        Add Colour
    </button>

    <button
        type="button"
        class="admin-delete-product-btn"
        onclick="deleteProduct(
            '${product.id}',
            '${product.code}',
            '${product.name}'
        )"
    >
        Delete Saree
    </button>

</div>

            `;


            adminProductList.appendChild(
                card
            );

        }
    );


    console.log(
        "Admin products loaded:",
        uniqueProducts.length
    );

}


// ==========================================
// TOGGLE COLOUR STOCK
// ==========================================

async function toggleColourStock(
    colourId,
    currentStatus
) {

    const newStatus =
        currentStatus === "Sold Out"
            ? "In Stock"
            : "Sold Out";


    const confirmChange =
        confirm(
            `Change stock status to "${newStatus}"?`
        );


    if (!confirmChange) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("product_colours")
            .update({
                availability:
                    newStatus
            })
            .eq(
                "id",
                colourId
            );


    if (error) {

        console.error(
            "Stock update error:",
            error
        );


        alert(
            "Unable to update stock."
        );

        return;
    }


    console.log(
        "Stock updated:",
        colourId,
        newStatus
    );


    await loadAdminProducts();

}


// ==========================================
// OPEN EDIT PRODUCT MODAL
// ==========================================

async function openEditProductModal(
    productId
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("products")
            .select("*")
            .eq(
                "id",
                productId
            )
            .single();


    if (error) {

        console.error(
            "Unable to load product:",
            error
        );


        alert(
            "Unable to load product details."
        );

        return;
    }


    document.getElementById(
        "editProductId"
    ).value =
        data.id;


    document.getElementById(
        "editProductCode"
    ).value =
        data.code || "";


    document.getElementById(
        "editProductName"
    ).value =
        data.name || "";


    document.getElementById(
        "editProductPrice"
    ).value =
        data.price || "";


    document.getElementById(
        "editOriginalPrice"
    ).value =
        data.original_price || "";

        document.getElementById(
    "editProductCategory"
).value =
    data.category || "";

    document.getElementById(
        "editProductFabric"
    ).value =
        data.fabric || "";


    document.getElementById(
        "editProductOccasion"
    ).value =
        data.occasion || "";


    document.getElementById(
        "editProductDescription"
    ).value =
        data.description || "";


    document.getElementById(
        "editProductAvailability"
    ).value =
        data.availability ||
        "In Stock";


    const message =
        document.getElementById(
            "editProductMessage"
        );


    if (message) {

        message.textContent =
            "";

    }


    const modal =
        document.getElementById(
            "editProductModal"
        );


    modal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


// ==========================================
// CLOSE EDIT PRODUCT MODAL
// ==========================================

function closeEditProductModal() {

    const modal =
        document.getElementById(
            "editProductModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


// ==========================================
// SAVE PRODUCT CHANGES
// ==========================================

const editProductForm =
    document.getElementById(
        "editProductForm"
    );


if (editProductForm) {

    editProductForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const productId =
                document.getElementById(
                    "editProductId"
                ).value;


            const productName =
                document.getElementById(
                    "editProductName"
                ).value.trim();


            const productPrice =
                document.getElementById(
                    "editProductPrice"
                ).value.trim();

                const category =
    document.getElementById(
        "editProductCategory"
    ).value;


            const originalPrice =
                document.getElementById(
                    "editOriginalPrice"
                ).value.trim();


            const fabric =
                document.getElementById(
                    "editProductFabric"
                ).value.trim();


            const occasion =
                document.getElementById(
                    "editProductOccasion"
                ).value.trim();


            const description =
                document.getElementById(
                    "editProductDescription"
                ).value.trim();


            const availability =
                document.getElementById(
                    "editProductAvailability"
                ).value;


            const message =
                document.getElementById(
                    "editProductMessage"
                );


            if (message) {

                message.textContent =
                    "Saving changes...";

            }


            const {
                error
            } =
                await supabaseClient
                    .from("products")
                    .update({
                        name:
                            productName,

                        price:
                            productPrice,

                        original_price:
                            originalPrice,
                        
                        category:
                                  category,    

                        fabric:
                            fabric,

                        occasion:
                            occasion,

                        description:
                            description,

                        availability:
                            availability
                    })
                    .eq(
                        "id",
                        productId
                    );


            if (error) {

                console.error(
                    "Product update error:",
                    error
                );


                if (message) {

                    message.textContent =
                        "Unable to save changes.";

                }

                return;
            }


            if (message) {

                message.textContent =
                    "Changes saved successfully.";

            }


            await loadAdminProducts();


            setTimeout(
                function () {

                    closeEditProductModal();

                },
                600
            );

        }
    );

}


// ==========================================
// CLOSE EDIT MODAL WHEN CLICKING OUTSIDE
// ==========================================

const editProductModal =
    document.getElementById(
        "editProductModal"
    );


if (editProductModal) {

    editProductModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                editProductModal
            ) {

                closeEditProductModal();

            }

        }
    );

}


// ==========================================
// ADD PRODUCT MODAL
// ==========================================

const addProductButton =
    document.getElementById(
        "addProductButton"
    );

const addProductModal =
    document.getElementById(
        "addProductModal"
    );

const addProductForm =
    document.getElementById(
        "addProductForm"
    );


if (addProductButton) {

    addProductButton.addEventListener(
        "click",
        function () {

            const message =
                document.getElementById(
                    "addProductMessage"
                );


            if (message) {

                message.textContent =
                    "";

            }


            if (addProductForm) {

                addProductForm.reset();


                document.getElementById(
                    "addProductBadge"
                ).value =
                    "New";


                document.getElementById(
                    "addProductAvailability"
                ).value =
                    "In Stock";

            }


            addProductModal.classList.add(
                "active"
            );


            document.body.style.overflow =
                "hidden";

        }
    );

}


// ==========================================
// CLOSE ADD PRODUCT MODAL
// ==========================================

function closeAddProductModal() {

    if (!addProductModal) {
        return;
    }


    addProductModal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


// ==========================================
// SAVE NEW PRODUCT
// ==========================================

if (addProductForm) {

    addProductForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const message =
                document.getElementById(
                    "addProductMessage"
                );


            if (message) {

                message.textContent =
                    "Adding saree...";

            }


            const newProduct = {

                code:
                    document.getElementById(
                        "addProductCode"
                    ).value.trim(),

                name:
                    document.getElementById(
                        "addProductName"
                    ).value.trim(),

                price:
                    document.getElementById(
                        "addProductPrice"
                    ).value.trim(),

                original_price:
                    document.getElementById(
                        "addOriginalPrice"
                    ).value.trim(),

                category:
                    document.getElementById(
                        "addProductCategory"
                    ).value,

                badge:
                    document.getElementById(
                        "addProductBadge"
                    ).value.trim(),

                fabric:
                    document.getElementById(
                        "addProductFabric"
                    ).value.trim(),

                occasion:
                    document.getElementById(
                        "addProductOccasion"
                    ).value.trim(),

                description:
                    document.getElementById(
                        "addProductDescription"
                    ).value.trim(),

                availability:
                    document.getElementById(
                        "addProductAvailability"
                    ).value

            };


            const {
                data,
                error
            } =
                await supabaseClient
                    .from("products")
                    .insert(
                        newProduct
                    )
                    .select()
                    .single();


            if (error) {

                console.error(
                    "Add product error:",
                    error
                );


                if (message) {

                    message.textContent =
                        `Unable to add saree: ${error.message}`;

                }

                return;
            }


            console.log(
                "New product added:",
                data
            );


            if (message) {

                message.textContent =
                    "Saree added successfully.";

            }


            await loadAdminProducts();


            setTimeout(
                function () {

                    closeAddProductModal();

                },
                700
            );

        }
    );

}


// ==========================================
// CLOSE ADD PRODUCT MODAL OUTSIDE CLICK
// ==========================================

if (addProductModal) {

    addProductModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                addProductModal
            ) {

                closeAddProductModal();

            }

        }
    );

}


// ==========================================
// ADD COLOUR MODAL
// ==========================================

const addColourModal =
    document.getElementById(
        "addColourModal"
    );

const addColourForm =
    document.getElementById(
        "addColourForm"
    );


function openAddColourModal(
    productId,
    productCode
) {

    if (
        !addColourModal ||
        !addColourForm
    ) {

        console.error(
            "Add colour modal elements not found."
        );

        return;
    }


    document.getElementById(
        "addColourProductId"
    ).value =
        productId;


    document.getElementById(
        "addColourProductCode"
    ).textContent =
        `Product: ${productCode}`;


    addColourForm.reset();


    document.getElementById(
        "addColourAvailability"
    ).value =
        "In Stock";


    document.getElementById(
        "addColourMessage"
    ).textContent =
        "";


    addColourModal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


// ==========================================
// CLOSE ADD COLOUR MODAL
// ==========================================

function closeAddColourModal() {

    if (!addColourModal) {
        return;
    }


    addColourModal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


// ==========================================
// ADD COLOUR + IMAGE UPLOAD
// ==========================================

if (addColourForm) {

    addColourForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const message =
                document.getElementById(
                    "addColourMessage"
                );


            const submitButton =
                addColourForm.querySelector(
                    'button[type="submit"]'
                );


            const productId =
                document.getElementById(
                    "addColourProductId"
                ).value;


            const colourName =
                document.getElementById(
                    "addColourName"
                ).value.trim();


            const availability =
                document.getElementById(
                    "addColourAvailability"
                ).value;


            const imageInput =
                document.getElementById(
                    "addColourImage"
                );


            const imageFile =
                imageInput.files[0];


            if (!imageFile) {

                message.textContent =
                    "Please choose an image.";

                return;
            }


            // Prevent double clicking
            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Uploading...";

            }


            message.textContent =
                "Uploading image...";


            const safeFileName =
                imageFile.name
                    .replace(
                        /[^a-zA-Z0-9.-]/g,
                        "-"
                    );


            const storagePath =
                `${productId}/${Date.now()}-${safeFileName}`;


            const {
                error: uploadError
            } =
                await supabaseClient
                    .storage
                    .from(
                        "product-images"
                    )
                    .upload(
                        storagePath,
                        imageFile,
                        {
                            cacheControl:
                                "3600",

                            upsert:
                                false
                        }
                    );


            if (uploadError) {

                console.error(
                    "Image upload error:",
                    uploadError
                );


                message.textContent =
                    `Image upload failed: ${uploadError.message}`;


                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Upload & Add Colour";

                }

                return;
            }


            const {
                data: publicUrlData
            } =
                supabaseClient
                    .storage
                    .from(
                        "product-images"
                    )
                    .getPublicUrl(
                        storagePath
                    );


            const imageUrl =
                publicUrlData.publicUrl;


            message.textContent =
                "Adding colour...";


            const {
                error: colourError
            } =
                await supabaseClient
                    .from(
                        "product_colours"
                    )
                    .insert({
                        product_id:
                            productId,

                        name:
                            colourName,

                        image_url:
                            imageUrl,

                        availability:
                            availability
                    });


            if (colourError) {

                console.error(
                    "Colour insert error:",
                    colourError
                );


                message.textContent =
                    `Unable to add colour: ${colourError.message}`;


                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Upload & Add Colour";

                }

                return;
            }


            message.textContent =
                "Colour added successfully.";


            await loadAdminProducts();


            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Upload & Add Colour";

            }


            setTimeout(
                function () {

                    closeAddColourModal();

                },
                700
            );

        }
    );

}


// ==========================================
// CLOSE ADD COLOUR MODAL OUTSIDE CLICK
// ==========================================

if (addColourModal) {

    addColourModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                addColourModal
            ) {

                closeAddColourModal();

            }

        }
    );

}


// ==========================================
// START ADMIN DASHBOARD
// ==========================================

async function startAdminDashboard() {

    console.log(
        "Starting SwaSra Admin Dashboard..."
    );


    const session =
        await checkAdminSession();


    if (!session) {
        return;
    }


    await loadAdminProducts();

}


// ==========================================
// START
// ==========================================

// ==========================================
// REMOVE COLOUR
// ==========================================

async function removeColour(
    colourId,
    imageUrl,
    colourName
) {

    const confirmDelete =
        confirm(
            `Remove "${colourName}" from this saree?`
        );


    if (!confirmDelete) {
        return;
    }


    // ==========================================
    // DELETE COLOUR RECORD
    // ==========================================

    const {
        error: deleteError
    } =
        await supabaseClient
            .from("product_colours")
            .delete()
            .eq(
                "id",
                colourId
            );


    if (deleteError) {

        console.error(
            "Colour delete error:",
            deleteError
        );


        alert(
            "Unable to remove colour."
        );

        return;
    }


    // ==========================================
    // DELETE STORAGE IMAGE IF IT IS FROM SUPABASE
    // ==========================================

    if (
        imageUrl &&
        imageUrl.includes(
            "/storage/v1/object/public/product-images/"
        )
    ) {

        try {

            const marker =
                "/storage/v1/object/public/product-images/";


            const storagePath =
                decodeURIComponent(
                    imageUrl.split(
                        marker
                    )[1]
                );


            if (storagePath) {

                const {
                    error: storageError
                } =
                    await supabaseClient
                        .storage
                        .from(
                            "product-images"
                        )
                        .remove([
                            storagePath
                        ]);


                if (storageError) {

                    console.error(
                        "Storage image delete error:",
                        storageError
                    );

                }

            }

        } catch (error) {

            console.error(
                "Unable to remove storage image:",
                error
            );

        }

    }


    alert(
        `"${colourName}" removed successfully.`
    );


    await loadAdminProducts();

}


// ==========================================
// DELETE PRODUCT
// ==========================================

async function deleteProduct(
    productId,
    productCode,
    productName
) {

    const confirmDelete =
        confirm(
            `Delete ${productCode} - ${productName}?\n\nThis will remove the saree and all its colours.`
        );


    if (!confirmDelete) {
        return;
    }


    // ==========================================
    // GET COLOUR IMAGES BEFORE DELETE
    // ==========================================

    const {
        data: colours,
        error: coloursError
    } =
        await supabaseClient
            .from("product_colours")
            .select(
                "image_url"
            )
            .eq(
                "product_id",
                productId
            );


    if (coloursError) {

        console.error(
            "Unable to load product colours:",
            coloursError
        );


        alert(
            "Unable to prepare product deletion."
        );

        return;
    }


    // ==========================================
    // DELETE SUPABASE STORAGE IMAGES
    // ==========================================

    const storageMarker =
        "/storage/v1/object/public/product-images/";


    const storagePaths =
        (colours || [])
            .map(
                function (colour) {

                    const imageUrl =
                        colour.image_url || "";


                    if (
                        !imageUrl.includes(
                            storageMarker
                        )
                    ) {
                        return null;
                    }


                    try {

                        return decodeURIComponent(
                            imageUrl.split(
                                storageMarker
                            )[1]
                        );

                    } catch (error) {

                        console.error(
                            "Storage path error:",
                            error
                        );

                        return null;
                    }

                }
            )
            .filter(
                function (path) {

                    return Boolean(path);

                }
            );


    if (storagePaths.length > 0) {

        const {
            error: storageError
        } =
            await supabaseClient
                .storage
                .from(
                    "product-images"
                )
                .remove(
                    storagePaths
                );


        if (storageError) {

            console.error(
                "Unable to delete product images:",
                storageError
            );

            // We continue because the database product
            // should still be removable.
        }

    }


    // ==========================================
    // DELETE PRODUCT
    // ==========================================

    const {
        error: productDeleteError
    } =
        await supabaseClient
            .from("products")
            .delete()
            .eq(
                "id",
                productId
            );


    if (productDeleteError) {

        console.error(
            "Product delete error:",
            productDeleteError
        );


        alert(
            "Unable to delete saree."
        );

        return;
    }


    alert(
        `${productCode} deleted successfully.`
    );


    await loadAdminProducts();

}

/* ==========================================
   ADMIN PRODUCT SEARCH
========================================== */

function initializeAdminProductSearch() {
    const searchInput =
        document.getElementById("adminProductSearch");

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener(
        "input",
        function () {
            const searchValue =
                searchInput.value
                    .trim()
                    .toLowerCase();

            const productCards =
                document.querySelectorAll(
                    ".admin-product-card"
                );

            productCards.forEach(function (card) {
                const productText =
                    card.textContent.toLowerCase();

                const matchesSearch =
                    productText.includes(searchValue);

                card.style.display =
                    matchesSearch ? "" : "none";
            });
        }
    );
}

initializeAdminProductSearch();

startAdminDashboard();