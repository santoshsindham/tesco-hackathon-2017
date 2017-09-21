package com.tescoplay.service;

public class Game {
	
	private String gameId;
	
	private String url;
	
	private String promoId;
	
	private boolean enabled;
	
	private String type = "game";

	public String getGameId() {
		return gameId;
	}

	public void setGameId(String gameId) {
		this.gameId = gameId;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getPromoId() {
		return promoId;
	}

	public void setPromoId(String promoId) {
		this.promoId = promoId;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}
	
	

}
