const Tour = require("../models/TourModel");

//  This controller is responsible for rendering data over screens
  const getOverview = async (req, res, next)=>{
    try {
      // 1. get Data from Collection
const tours = await Tour.find();
    // 2. Build Template
    // 3. Render that template using This Data from step 1



    res.status(200).render('overview',{
      title: 'All Tours',
      tours
    }); // system will look for base file in views folder specified above
    } catch (error) {
      // res.status(400).render(<h1>Error Occurred</h1>)
    }
  }
  
  const getTour =(req, res)=>{
    res.status(200).render('tour',{
      title: 'The Forest Hiker'
    }); // system will look for base file in views folder specified above
  }

module.exports = {
    getOverview, getTour
}