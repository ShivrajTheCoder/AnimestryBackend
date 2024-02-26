function calculateTotalAmount(productData, otherProductData, products, codediscount) {
    let totalAmountWithoutDiscount = 0;
    let totalAmountWithDiscount = 0;
    let productDiscountTotal = 0;

    products.forEach(product => {
        const matchedProduct = productData.find(p => p._id.toString() === product.productId.toString());
        if (matchedProduct) {
            totalAmountWithoutDiscount += matchedProduct.price * product.quantity;
            const discountedPrice = matchedProduct.price - (matchedProduct.price * (matchedProduct.discount / 100));
            totalAmountWithDiscount += discountedPrice * product.quantity;

        } else {
            const matchedOtherProduct = otherProductData.find(p => p._id.toString() === product.productId.toString());
            totalAmountWithoutDiscount += matchedOtherProduct.price * product.quantity;
            const discountedPrice = matchedOtherProduct.price - (matchedOtherProduct.price * (matchedOtherProduct.discount / 100));
            totalAmountWithDiscount += discountedPrice * product.quantity;
        }
    });

    let totalAmount;

    if (codediscount) {
        totalCodeDis = totalAmountWithoutDiscount - (totalAmountWithoutDiscount * codediscount / 100);
        totalAmount = Math.min(totalCodeDis, totalAmountWithDiscount);
    } else {
        totalAmount = totalAmountWithDiscount;
    }

    return totalAmount;
}

module.exports = calculateTotalAmount;
