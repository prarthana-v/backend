const Address = require("../models/AddressModel");
const cartService = require("./cartService");

async function createorder(user, shippingAddress) {
  let address;
  if (shippingAddress._id) {
    let AddressExist = await Address.findById(shippingAddress._id).populate(
      "user"
    );
    address = AddressExist;
  } else {
    address = new Address(shippingAddress);
    address.user = user;
    await address.save();

    user.addresses.push(address);
    await user.save();
  }
}
