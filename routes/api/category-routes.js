const router = require('express').Router();
const sequelize = require('sequelize');
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product }],
    });
    if (!categoryData) {
      res.status(404).json({ message: 'No Categories exist.'});
      return;
    }
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: ({ model: Product }),
    });
    if (!categoryData) {
      res.status(404).json({ message: 'No Category exists with this id.' });
      return;
    }
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new category
  Category.create(req.body)
  .then((category) => {
    if (req.body.product.length) {
      const productArr = req.body.product.map((product) => {
        return {
          category_id: category.id,
          category_name: category.category_name,
          product,
        };
      });
      return Product.bulkCreate(productArr);
    }
    res.status(200).json(category);
  })
  .then((products) => res.status(200).json(products))
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      attributes: {
        include: [
            sequelize.literal(
              `UPDATE category SET category_name = ${req.body.category_name} WHERE id = ${req.params.id};`
            )
        ],
      },
    });

    if (!categoryData) {
      res.status(404).json({ message: 'No Category Found with id: ${req.params.id}'});
      return;
    }
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!categoryData) {
      res.status(404).json({ message: 'No Category found with that id.' });
      return;
    }
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
