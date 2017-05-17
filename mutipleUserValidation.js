/**************************************************** ���û�������ͬ������֤  start************************************************/
/**
 * 
 * 1.Aɾ��ĳ��¼��B�޸���ͬ��¼
 * 2.A�޸�ĳ��¼��B�޸���ͬ��¼
 * 
 */
//���һ�κ͸���ʱ������
function consistentObj(){
	/**	object instance unique ID	*/
	this.id = $.expando+new Date();
	//param length
	this.initValue=null;
	//��ʼ������ʱ��
	this.initialTime=null;
	//�ύǰ����ʱ��
	this.lastTime=null;
	//������ʶ 1���޸� 2��ɾ��  Ĭ��0
	this.action=0;
	//number
	this.size=0;
	//operator
	this.operateUserId=null;
	//operate time
	this.operateDateTime=null;
	
	
}

//js��ȡ��Ŀ��·�����磺 http://localhost:8083/uimcardprj
function getRootPath(){
    //��ȡ��ǰ��ַ���磺 http://localhost:8083/uimcardprj/share/meun.jsp
    var curWwwPath=window.document.location.href;
    //��ȡ������ַ֮���Ŀ¼���磺 uimcardprj/share/meun.jsp
    var pathName=window.document.location.pathname;
    var pos=curWwwPath.indexOf(pathName);
    //��ȡ������ַ���磺 http://localhost:8083
    var localhostPaht=curWwwPath.substring(0,pos);
    //��ȡ��"/"����Ŀ�����磺/uimcardprj
    var projectName=pathName.substring(0,pathName.substr(1).indexOf('/')+1);
    return (localhostPaht+projectName);
}

consistentObj.prototype={
		initParam:function(arguments){
			if(!arguments||arguments.length==0){
				throw new Error("����������Ȳ���Ϊ�գ�");
				return;
			}
			var strs=this.initValue=this.paramComposite(arguments);
			if(strs){
				this.setSize(strs.split("&").length);
			}
		},
		//������id��Ӧһ��ʵ��
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
				msg="�����������Ϊ��";
				throw new Error(msg);
				return;
			}
			if(len%2!=0){
				msg="������������������飡";
				throw new Error(msg);
				return;
			}
			//������ ͳһ����
			splitRet=this.arraySplit(input);
			if(splitRet==null){
				msg="��������������飡";
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
		//�����������Ҫ��֤��id+��Ӧʵ������=>����Map��id: ��һ�θ���ʱ�䣩
		//���Դ����������
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
		//�������1�� id1��pojoName1,id2��pojoName2,id3��pojoName3....
		//�������2��{pojoName3 : [id1��id2��,id3]��....}
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
		//����+pojos����=>����Map��id: datetime��
		_setLastDate:function(obj){
			this.lastTime=obj;
		},
		getLastDate:function(){
			return this.lastTime;
		},
		//set last update datetime
		//������� id1��pojoName1,id2��pojoName2,id3��pojoName3....
		setLastDate:function(arg){
			var initValue=this.initValue,lastValue=this.paramComposite(arg);
			if(initValue!==lastValue){
				throw new Error("���δ��������һ�£����飡");
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
				throw new Error("������÷���ֵ����Ϊnull��");
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
		//���ò�����Ϊ
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
				return "������û�б������û��޸ģ�";
			}
			var category=(val==1?"�޸�":"ɾ��");
			return val==1?"�������Ѿ��������û�"+category+"���Ƿ�ֱ�Ӹ������޸����ݣ�":"�������Ѿ��������û�"+category+"���뷵��ˢ�º����²���!";
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
				var msg="���δ��ʼ�������飡";
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
					//���޸�
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
									throw new Error("��ͬʱ����ȷ�Ϻ�ȡ����Ӧ������");
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

//���������jQuery������Ϊ���߷�������
jQuery.extend({timeValid:dataConsistentValid});
/**************************************************** ���û�������ͬ������֤  end************************************************/
