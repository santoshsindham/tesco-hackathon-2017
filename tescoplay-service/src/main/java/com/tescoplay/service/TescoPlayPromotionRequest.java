package com.tescoplay.service;

public class TescoPlayPromotionRequest {
	
	private String promotionId;
	
	private String promoType;
	
	private String calType;
	
	private long factor;

	public String getPromotionId() {
		return promotionId;
	}

	public void setPromotionId(String promotionId) {
		this.promotionId = promotionId;
	}

	public String getPromoType() {
		return promoType;
	}

	public void setPromoType(String promoType) {
		this.promoType = promoType;
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
