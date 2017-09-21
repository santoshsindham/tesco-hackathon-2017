package com.tescoplay.service;

public class TescoPlayResponse {
	
	private String customerId;
	
	private long points;
	
	private long addedPoints;
	
	private String voucherCode;
	
	private boolean success;
	
	private String errorDesc;

	public String getCustomerId() {
		return customerId;
	}

	public void setCustomerId(String customerId) {
		this.customerId = customerId;
	}

	public long getPoints() {
		return points;
	}

	public void setPoints(long points) {
		this.points = points;
	}

	public String getVoucherCode() {
		return voucherCode;
	}

	public void setVoucherCode(String voucherCode) {
		this.voucherCode = voucherCode;
	}

	public long getAddedPoints() {
		return addedPoints;
	}

	public void setAddedPoints(long addedPoints) {
		this.addedPoints = addedPoints;
	}

	public boolean isSuccess() {
		return success;
	}

	public void setSuccess(boolean success) {
		this.success = success;
	}

	public String getErrorDesc() {
		return errorDesc;
	}

	public void setErrorDesc(String errorDesc) {
		this.errorDesc = errorDesc;
	}

}
