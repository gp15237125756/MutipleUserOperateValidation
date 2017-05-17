/**************************************************** 多用户操作相同数据验证  start************************************************/
/**
 * 
 * 1.A删除某记录，B修改相同记录
 * 2.A修改某记录，B修改相同记录
 * 
 */
//最后一次和更新时间点对象
function consistentObj(){
	/**	object instance unique ID	*/
	this.id = $.expando+new Date();
	//param length
	this.initValue=null;
	//初始化更新时间
	this.initialTime=null;
	//提交前更新时间
	this.lastTime=null;
	//操作标识 1：修改 2：删除  默认0
	this.action=0;
	//number
	this.size=0;
	//operator
	this.operateUserId=null;
	//operate time
	this.operateDateTime=null;
	
	
}

//js获取项目根路径，如： http://localhost:8083/uimcardprj
function getRootPath(){
    //获取当前网址，如： http://localhost:8083/uimcardprj/share/meun.jsp
    var curWwwPath=window.document.location.href;
    //获取主机地址之后的目录，如： uimcardprj/share/meun.jsp
    var pathName=window.document.location.pathname;
    var pos=curWwwPath.indexOf(pathName);
    //获取主机地址，如： http://localhost:8083
    var localhostPaht=curWwwPath.substring(0,pos);
    //获取带"/"的项目名，如：/uimcardprj
    var projectName=pathName.substring(0,pathName.substr(1).indexOf('/')+1);
    return (localhostPaht+projectName);
}

consistentObj.prototype={
		initParam:function(arguments){
			if(!arguments||arguments.length==0){
				throw new Error("传入参数长度不能为空！");
				return;
			}
			var strs=this.initValue=this.paramComposite(arguments);
			if(strs){
				this.setSize(strs.split("&").length);
			}
		},
		//处理多个id对应一个实体
		arraySplit:function(input){
			var src=input,ret=[],i=0,len=src.length;
			for(;i<len;){
				var element=src[i];
				if(jQuery.type(element)==="array"&&element.length>0){
					for(var j in element){
						ret.push(element[j]);
						ret.push(src[i+1]);
					}
					i+=2;
				}else{
					ret.push(element);
					i++;
				}
			}
			return ret;
		},
		paramComposite:function(arr){
			var msg=null,paramStr="",input=arr,splitRet=null,len=arr.length,start=0,result=[],each={};
			if(len==0){
				msg="传入参数不能为空";
				throw new Error(msg);
				return;
			}
			if(len%2!=0){
				msg="传入参数个数错误，请检查！";
				throw new Error(msg);
				return;
			}
			//数组拆分 统一处理
			splitRet=this.arraySplit(input);
			if(splitRet==null){
				msg="传入参数错误，请检查！";
				throw new Error(msg);
				return;
			}
			//iterate arguments
			//odd cancat '='
			//even cancat '&'
			for(;start<splitRet.length;start++){
				var curValue=splitRet[start];
				if(start%2==0){
					each.name=curValue;
				}else{
					each.value=curValue;
				}
				if((start+1)%2==0){
					result.push(each);
					each={};
				}
			}
			if(result.length>0){
				paramStr=jQuery.param(result);
			}
			return paramStr;
		},
		//传入参数：需要验证的id+对应实体名称=>返回Map（id: 上一次更新时间）
		//可以传入参数类型
		//1.Map   e.g	map.container={ 1:"a",  2:"b"}
		//2.JSON Object e.g	{ 1:"a",  2:"b"}
		//3.string e.g  {"1":"a","2":"b"}
		_setFirstDate:function(obj){
			this.initialTime=obj;
		},
		getFirstDate:function(){
			//get each updateTime corresponding to specified ID
			return this.initialTime;
		},
		//set last update datetime
		//传入规则1： id1，pojoName1,id2，pojoName2,id3，pojoName3....
		//传入规则2：{pojoName3 : [id1，id2，,id3]，....}
		setFirstDate:function(arg){
			this.initParam(arg);
			var param=this.paramComposite(arg),date=null;
			$.comSearchAjax({
				type : "POST",
				async : false,
				cache : false,
				url : getRootPath()+"/consistent/init/init",
				data : {"validMaps":param},
				success : function(ret) {
					if(ret){
						data=ret.data;
					}
				}
			});
			this._setFirstDate(data);
			//this.initialTime = {};
			/*Object.defineProperty( this.initialTime = {}, 0, {
				get: function() {
					return {};
				}
			});*/
			//getFirstDate();
		},
		//主键+pojos名称=>返回Map（id: datetime）
		_setLastDate:function(obj){
			this.lastTime=obj;
		},
		getLastDate:function(){
			return this.lastTime;
		},
		//set last update datetime
		//传入规则： id1，pojoName1,id2，pojoName2,id3，pojoName3....
		setLastDate:function(arg){
			var initValue=this.initValue,lastValue=this.paramComposite(arg);
			if(initValue!==lastValue){
				throw new Error("两次传入参数不一致，请检查！");
				return;
			}
			var param=this.paramComposite(arg),data=null;
			$.comSearchAjax({
				type : "POST",
				async : false,
				cache : false,
				url : getRootPath()+"/consistent/init/init",
				data : {"validMaps":param},
				success : function(ret) {
					if(ret){
						data=ret.data;
					}
				}
			});
			this._setLastDate(data);
		},
		//true: data not modified ; false: data modified 
		compareDates:function(){
			var initial=this.getFirstDate(),lastTime=this.getLastDate(),size=this.size;
			if(!initial||!lastTime){
				throw new Error("插件调用返回值不能为null！");
			}
			var jsonStart=JSON.stringify(initial),jsonEnd=JSON.stringify(lastTime);
			if(jsonStart!==jsonEnd){
				if(size>1){
					//update
					this.assignAction(1);
				}else{
					if(jsonEnd.indexOf("null")>0){
						//delete
						this.assignAction(2);
					}else{
						//update
						this.assignAction(1);
					}
				}
				return false;
			}
			return true;
		},
		//设置操作行为
		assignAction:function(val){
			this.action=val;
		},
		getAction:function(){
			return this.action;
		},
		getSize:function(){
			return this.size;
		},
		setSize:function(num){
			this.size=num;
		},
		alertTxt:function(val){
			if(val==0){
				return "该数据没有被其他用户修改！";
			}
			var category=(val==1?"修改":"删除");
			return val==1?"该数据已经被其他用户"+category+"，是否直接覆盖已修改数据？":"该数据已经被其他用户"+category+"，请返回刷新后重新操作!";
		}
		
		
}
var dataConsistentValid=(function($,undefined){
	var obj=null;
	return {
		init:function(){
			obj=new consistentObj();
		},
		setStartTime:function(){
			this.init();
			obj.setFirstDate(arguments);
		},
		setEndTime:function(){
			if(!obj){
				var msg="插件未初始化，请检查！";
				throw new Error(msg);
				return;
			}
			obj.setLastDate(arguments);
		},
		valid:function(option){
			var valid=false,confirm=false,opts={okFunc:null,cancelFunc:null,closeFunc:null};
			try{
				if(obj){
					var result=obj.compareDates();
					//被修改
					if(!result){
						if(option){
							jQuery.extend(opts,option);
							//delete
							var act=obj.getAction();
							if(act==2&&opts.cancelFunc&&$.type(opts.cancelFunc)==="function"){
								if(opts.closeFunc&&$.type(opts.closeFunc)==="function"){
									showAlert(obj.alertTxt(act),opts.cancelFunc,2,opts.closeFunc);
								}else{
									showAlert(obj.alertTxt(act),opts.cancelFunc,2);
								}
							}else if(act==1){
								if(!opts.okFunc||!opts.cancelFunc||!$.type(opts.okFunc)==="function"||!$.type(opts.cancelFunc)==="function"){
									throw new Error("请同时传入确认和取消对应方法！");
								}
								if(opts.closeFunc&&$.type(opts.closeFunc)==="function"){
									showConfirm(obj.alertTxt(act),opts.okFunc,opts.cancelFunc,opts.closeFunc);
								}else{
									showConfirm(obj.alertTxt(act),opts.okFunc,opts.cancelFunc);
								}
								
							}
						}
						
					}else{
						valid=true;
					}
				}
			}catch(e){
				throw e;
			}finally{
				obj==null;
			}
			return valid;
		}
	}
})(jQuery);

//将插件加入jQuery对象作为工具方法调用
jQuery.extend({timeValid:dataConsistentValid});
/**************************************************** 多用户操作相同数据验证  end************************************************/
