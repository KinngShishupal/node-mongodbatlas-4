 
  const getOverview = (req, res)=>{
    res.status(200).render('overview',{
      title: 'All Tours'
    }); // system will look for base file in views folder specified above
  }
  
  const getTour =(req, res)=>{
    res.status(200).render('tour',{
      title: 'The Forest Hiker'
    }); // system will look for base file in views folder specified above
  }

module.exports = {
    getOverview, getTour
}