const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
      id: nextId(),
      name,
      description,
      price,
      image_url
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
  } 
  
  function hasName(req, res, next) {
    const { data: { name } = {} } = req.body;
  
    if (name) {
      return next();
    }
    next({ status: 400, message: "A 'name' property is required." });
  }

  function hasDescription(req, res, next) {
    const { data: { description } = {} } = req.body;
  
    if (description) {
      return next();
    }
    next({ status: 400, message: "A 'description' property is required." });
  }

  function hasPrice(req, res, next) {
    const { data: { price } = {} } = req.body;
  
    let validPrice = "Y";

    if (!price) {
    	validPrice = "N";
    }

    if(typeof price !== 'number') {
    	validPrice = "N";
    }

    if (price <= 0) {
    	validPrice = "N";
    }
    
    if (isNaN(price)) {
    	validPrice = "N";
    }
    
    if (validPrice === "Y") {
    	return next();
    }

    next({ status: 400, message: "A 'price' property is required." });
  }

  function hasImage(req, res, next) {
    const { data: { image_url } = {} } = req.body;
  
    if (image_url) {
      return next();
    }
    next({ status: 400, message: "An 'image_url' property is required." });
  }

  function list(req, res) {
    res.json({ data: dishes });
  }
  
  function dishExists(req, res, next) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
      res.locals.dish = foundDish;
      return next();
    }
    next({
      status: 404,
      message: `Dish id not found: ${req.params.dishId}`,
    });
  }
  
  function read(req, res) {
    res.json({ data: res.locals.dish });
  }

  function idPropertyIsValid(req, res, next){
    const { data: {id} = {} } = req.body;
    const {dishId} = req.params;
    if(id && dishId !== id){
        next({status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`});
    }
    return next();
}

  function update(req, res) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);

    const { data: { id, name, description, price, image_url } = {} } = req.body;
  
    if (foundDish.id == dishId) {
        foundDish.name = name;
        foundDish.description = description;
        foundDish.price = price;
        foundDish.image_url = image_url;
        res.json({ data: foundDish });
    }
    next({ status: 400});
}
  
  module.exports = {
    create: [hasName, hasDescription, hasPrice, hasImage, create],
    list,
    dishExists,
    read: [dishExists, read],
    update: [dishExists, hasName, hasDescription, hasPrice, hasImage, idPropertyIsValid, update],
  };
  
  