const Item = require("../models/item");
const User = require("../models/user");

const initialItems = [
  {
    _id: "625fc3035965f5afa2a08e06",
    latin: "Marasmius oreades",
    common: ["Fairy ring mushroom", "Fairy ring champignon"],
    __v: 0,
  },
  {
    _id: "625fc34d5965f5afa2a08e07",
    latin: "Lycoperdon utriformis",
    common: ["Mosaic puffball"],
    __v: 0,
  },
];

// const nonExistingId = async () => {
//   const dummyItem = {
//     _id: "525fc3035965f5afa2a08e06",
//     latin: "dummyName",
//     common: ["dummy"],
//     __v: 0,
//   };
//   const item = new Item(dummyItem);
//   await item.save();
//   await item.remove();

//   return item._id.toString();
// };

const itemsInDb = async () => {
  const items = await Item.find({});
  return items.map((item) => item.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

module.exports = {
  initialItems,
  itemsInDb,
  usersInDb,
};
