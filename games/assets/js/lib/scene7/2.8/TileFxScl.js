/*!************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2012 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/
s7sdk.Util.require("s7sdk.common.Geometry");s7sdk.Util.require("s7sdk.event.Event");if(!s7sdk.TileFxScl){s7sdk.TileFxScl=function(c,b,a){this.image=new Image();this.tileAddress=c;this.loaded=false;this.fmt=(typeof a=="string")?a:"jpg";this.transparent=((this.fmt.indexOf("png")!=-1||this.fmt.indexOf("gif")!=-1)&&(this.fmt.indexOf("-alpha")>0))?true:false;this.image.style.display="none";if(b!=null){this.loadTile(b)}};s7sdk.TileFxScl.TILE_SIZE=256;s7sdk.TileFxScl.TILE_LOADED="tileLoaded";s7sdk.TileFxScl.prototype.loadTile=function(a){s7sdk.Logger.log(s7sdk.Logger.FINER,"s7sdk.TileFxScl.loadTile - tileAddress.x: %0, tileAddress.y: %1",this.tileAddress.x(),this.tileAddress.y());var b=a+"&req=tile&rect="+this.tileAddress.x()*s7sdk.TileFxScl.TILE_SIZE+","+this.tileAddress.y()*s7sdk.TileFxScl.TILE_SIZE+","+this.tileAddress.w+","+this.tileAddress.h;b+="&fmt="+this.fmt;this.image.onload=this.onLoadImage;this.image.onerror=this.onErrorImage;this.image.onabort=this.onErrorImage;this.image.src=b};s7sdk.TileFxScl.prototype.onLoadImage=function(a){this.style.display="block";s7sdk.Event.dispatch(this,s7sdk.Event.TILE_LOADED,true)};s7sdk.TileFxScl.prototype.onErrorImage=function(a){s7sdk.Event.dispatch(this,s7sdk.Event.TILE_FAILED,true)};s7sdk.TileFxScl.prototype.getImage=function(){return this.image};s7sdk.TileFxScl.prototype.setUrl=function(a){this.loadTile(a)}};