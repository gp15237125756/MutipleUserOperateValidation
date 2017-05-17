# MutipleUserOperateValidation
In some scenarios, mutiple authorizated users could manipulate one data in database which is submitted from different clients.In majority time,this make no conflicts.But 
if the actions occur at the same time,then conflicts happen.The key problem is one find the data changed before operated eventually over minutes.
Take care that the problem has no business with concurreny.Just for instance,user A opens a web page which is binded with data X in db.Then A do nothing any more in 5 minutes.
Unfortunately,user B opens the page and mend the  data X over the time.While user A submits the data at last,exception occurs.

# Design 
- data model 
    data model is designed with extra updateDateTime column which represents newest time the data is updated.
    
- backend common service
    it depends on concret program structure.However,the service return the current updateDateTime according to data model name and id attributes.
    
- web page
  in write situations(read has no conflicts),u fetch the data to single page with updateDateTime property.EveryTime before submit the update,validate the data whether mended by others.
  
