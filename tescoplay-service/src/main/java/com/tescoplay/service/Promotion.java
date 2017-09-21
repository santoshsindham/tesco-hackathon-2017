package com.tescoplay.service;

public class Promotion {
	
	private String promotionId;
	
	private String promotionType;
	
	
	private String type = "promotion";
	
	private String calType;
	
	private long factor;

	public String getPromotionId() {
		return promotionId;
	}

	public void setPromotionId(String promotionId) {
		this.promotionId = promotionId;
	}

	public String getPromotionType() {
		return promotionType;
	}

	public void setPromotionType(String promotionType) {
		this.promotionType = promotionType;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getCalType() {
		return calType;
	}

	public void setCalType(String calType) {
		this.calType = calType;
	}

	public long getFactor() {
		return factor;
	}

	public void setFactor(long factor) {
		this.factor = factor;
	}

	

}
