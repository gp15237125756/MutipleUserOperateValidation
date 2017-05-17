# MutipleUserOperateValidation
In some scenarios, mutiple authorizated users could manipulate one data in database which is submitted from different clients.In majority time,this make no conflicts.But 
if the actions occur at the same time,then conflicts happen.The key problem is one find the data changed before operated eventually over minutes.
Take care that the problem has no business with concurreny.Just for instance,user A opens a web page which is binded with data X in db.Then A doesn't operate any more over 5 minutes.
Unfortunately,user B opens the page and mend the specified data between the time.While user A submits the data at last,exception occurs.
