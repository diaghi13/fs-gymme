const MyMath = {

  percentageDiscount: (price: number, discount: number) => {
    const priceValue = Number(price);
    const discountValue = Number(discount);

    return (priceValue * discountValue) / 100
  },

  percentageDiscounted: (price: number, discount: number) => {
    const priceValue = Number(price);

    return priceValue - MyMath.percentageDiscount(price, discount)
  },

  absoluteDiscounted: (price: number, discount: number) => {
    const priceValue = Number(price);
    const discountValue = Number(discount);

    return priceValue - discountValue;
  },
}

export default MyMath
