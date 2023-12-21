const path = require("path");

// dish the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// dish this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data.price < 0) {
        return next({
            status: 400,
            message: `price can't be less than 0`
        });
      }
      if (data[propertyName]) {
        return next();
      }
      next({
          status: 400,
          message: `Must include a ${propertyName}`
      });
    };
  }
  
  function list(req, res) {
    const { urlId } = req.params;
    res.json({ data: dishes.filter(urlId ? dish => dish.id == urlId : () => true) });
  }
  
  function dishExists(req, res, next) {
    const dishId = req.params.dishId;
    const founddish = dishes.find((dish) => dish.id === dishId);
    if (founddish) {
      return next();
    }
    next({
      status: 404,
      message: `dish id not found: ${dishId}`,
    });
  }
  
  function create(req, res) {
    const { data: { name, description,image_url, price } = {} } = req.body;
    const newdish = {
      id: dishes.length + 1,
      name,
      description,
      price,
      image_url,
    };
    dishes.push(newdish);
    res.status(201).json({ data: newdish });
  }
  
  function read(req, res) {
    const dishId = req.params.dishId;
    const founddish = dishes.find((dish) => dish.id === dishId);
    res.json({ data: founddish });
  }
  
  function update(req, res) {
    const { dishId } = req.params;
    const founddish = dishes.find((dish) => dish.id === dishId);
    const { data: { id, name, description,image_url, price } = {} } = req.body;

    if (!Number.isInteger(price)) {
      res.status(400).json({ error: "dish price is not a number" });
    }

    if (id !== undefined && id !== null && id !== "" && id !== dishId) {
      res.status(400).json({ error: `id ${id} does not match ${dishId} in the route` });
    }

    // update the dish
    founddish.name = name;
    founddish.description = description;
    founddish.image_url = image_url;
    founddish.price = price;
  
    res.status(200).json({ data: founddish });
  }
  
  function destroy(req, res) {
    const { dishId } = req.params;
    const index = dishes.findIndex((dish) => dish.id === dishId);
    // `splice()` returns an array of the deleted elements, even if it is one element
    const deleteddishes = dishes.splice(index, 1);
    res.sendStatus(204);
  }
  
  module.exports = {
    create: [bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("price"),
    bodyDataHas("image_url"), create],
    list,
    read: [dishExists, read],
    update: [dishExists,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        update],
    delete: [dishExists, destroy],
  };