const { Router } = require("express");
require("dotenv").config();
const auth = require('../middleware/auth.js');
const authAdmin = require('../middleware/authAdmin.js')
const jf = require('jsonfile')
const path = './test/data.json'
const file = jf.readFileSync(path)

const logger = require('../utils/winston.js')

const router = Router();

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

const findBookById = (id) => {
    const books = file.books
    const bookFound = books.filter((book) => {
        if (book.id === id) {
             return book
        }   
    });
    if (bookFound.length>0){
        return bookFound
    }
    return false
}

router.get('/', (req, res) => {
  try {
    return res.status(200).json({
      success: "true",
      message: "books",
      books: file.books,
    });
  } catch (err) {
    logger.error('error in login: '+err)
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
})

router.get('/:id', (req, res) => {
  try {
    return res.status(200).json({
      success: "true",
      message: "books",
      books: file.books[req.params.id]
    });
  } catch (err) {
    logger.error('error in login: '+err)
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
})

router.post('/', auth, (req, res) => {
  try {
    let now = new Date()
    const dateout = now.addDays(5)
    const owner = {
        id: req.user.id,
        name: req.user.name,
        datein: `${now.getDay().toString().padStart(2, '0')}.${(now.getMonth()+1).toString().padStart(2, '0')}.${now.getFullYear()}`,
        dateout: `${dateout.getDay().toString().padStart(2, '0')}.${(dateout.getMonth()+1).toString().padStart(2, '0')}.${dateout.getFullYear()}`
    }
    const book = {
      id: file.books.length,
      name: req.body.name,
          author: req.body.author,
          realese: req.body.realese,
          owner: owner,
          search_tags: req.body.search_tags
    }
    jf.readFile(path, (err, obj) => {
          if (err) throw err;
          let fileObj = obj;
          fileObj.books.push(book);
          jf.writeFile(path, fileObj, {spaces: 2},(err) => {
            if (err) throw err;
          })
      })
    return res.status(200).json({
        success: "true",
        message: "book added successfully",
        book: book,
    });
  } catch (err) {
    logger.error('error in login: '+err)
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
})

router.put('/:id', auth, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const bookFound = findBookById(id);
    if (!bookFound) {
        return res.status(404).json({
          success: 'false',
          message: 'user not found',
        });
      }
      const book = {
      id: id,
      name: req.body.name || req.body.name,
      author: req.body.author || req.body.author,
      realese: req.body.realese || req.body.realese,
      owner: req.body.owner || req.body.owner,
      search_tags: req.body.search_tags || req.body.search_tags
    }
    jf.readFile(path, (err, obj) => {
        if (err) throw err;
        let fileObj = obj;
        fileObj.books[id] = book;
        jf.writeFile(path, fileObj, {spaces: 2}, (err) => {
          if (err) throw err;
        })
    })
    return res.status(200).json({
      success: "true",
      message: "book updated successfully",
      book: book,
    });
  } catch (err) {
    logger.error('error in login: '+err)
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
})

router.delete('/:id', auth, authAdmin, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    jf.readFile('/siuuuuuuuuuu', (err, obj) => {
        if (err) throw err;
        let fileObj = obj;
        fileObj.books.splice(id, 1);
        jf.writeFile(path, fileObj, {spaces: 2}, (err) => {
          if (err) throw err;
        })
    })
    return res.status(200).json({
      success: "true",
      message: "book deleted successfully",
      book: file.books[id]
    });
  } catch (err) {
    logger.error('error in login: '+err)
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
})

module.exports = router;