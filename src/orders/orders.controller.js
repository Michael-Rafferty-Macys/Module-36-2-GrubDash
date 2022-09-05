const path = require("path");

// Use the existing orders data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function create(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
      id: nextId(),
      deliverTo,
      mobileNumber,
      status,
      dishes
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
  } 
  
  function hasDeliverTo(req, res, next) {
    const { data: { deliverTo } = {} } = req.body;
  
    if (deliverTo) {
      return next();
    }
    next({ status: 400, message: "A 'deliverTo' property is required." });
  }

  function hasMobileNumber(req, res, next) {
    const { data: { mobileNumber } = {} } = req.body;
  
    if (mobileNumber) {
      return next();
    }
    next({ status: 400, message: "A 'mobileNumber' property is required." });
  }

  function hasStatus(req, res, next) {
    const { data: { status } = {} } = req.body;
  
    if (status) {
      return next();
    }
    next({ status: 400, message: "A 'status' property is required." });
  }

  function hasDishes(req, res, next) {
    const { data: { dishes } = {} } = req.body;

    let validDishes = "Y";

    if (!dishes) {
    	validDishes = "N";
    }

    if(!Array.isArray(dishes)) {
    	validDishes = "N";
    }

    if (dishes) {
        if(Array.isArray(dishes)) {
            if (dishes.length === 0) {
    	        validDishes = "N";
            }
        }
    }
    
    if (validDishes === "Y") {
    	return next();
    }

    next({ status: 400, message: "A 'dishes' property is required." });
  }

  function list(req, res) {
    res.json({ data: orders });
  }
  
  function orderExists(req, res, next) {
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
      res.locals.order = foundOrder;
      return next();
    }
    next({
      status: 404,
      message: `Order id not found: ${req.params.orderId}`,
    });
  }
  
  function read(req, res) {
    res.json({ data: res.locals.order });
  }

  function idPropertyIsValid(req, res, next){
    const { data: {id} = {} } = req.body;
    const {orderId} = req.params;
    if(id && orderId !== id){
        next({status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`});
    }
    return next();
}

function verifyUpdateStatus(req, res, next) {
    const { data: { status } = {} } = req.body;
    if (!status || ( status !== "pending" && status !== "preparing" && status !== "out-for-delivery") ) {
      return next({
        status: 400,
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
      });
    } else if (status === "delivered") {
      return next({
        status: 400,
        message: `A delivered order cannot be changed`,
      });
    }
    next();
  }
  
  function update(req, res) {
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => order.id === orderId);

    const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  
    if (foundOrder.id == orderId) {
        foundOrder.deliverTo = deliverTo;
        foundOrder.mobileNumber = mobileNumber;
        foundOrder.status = status;
        foundOrder.dishes = dishes;
        res.json({ data: foundOrder });
    }
    next({ status: 400});
}

function destroy(req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === orderId);
    if (index > -1) {
      orders.splice(index, 1);
    }
    res.sendStatus(204);
  }

  function validQuantity(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    dishes.forEach((dish, index) => {
      const quantity = dish.quantity;
      if (!quantity || quantity < 1 || Number(quantity) !== quantity) {
        next({
          status: 400,
          message: `Dish ${index} must have a quantity that is an integer greater than 0`,
        });
      }
    });
    next();
  }

  function verifyDeleteStatus(req, res, next) {
    const order = res.locals.order;
    if (order.status === "pending") {
      return next();
    } else {
      return next({
        status: 400,
        message: `An order cannot be deleted unless it is pending`,
      });
    }
  }

  module.exports = {
    create: [hasDeliverTo, hasMobileNumber, hasDishes, validQuantity, create],
    list,
    orderExists,
    read: [orderExists, read],
    update: [orderExists, hasDeliverTo, hasMobileNumber, hasStatus, hasDishes, idPropertyIsValid, verifyUpdateStatus, validQuantity, update],
    delete: [orderExists, verifyDeleteStatus, destroy],
  };
  
              
