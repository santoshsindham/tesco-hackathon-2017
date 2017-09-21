package com.tescoplay.service;

import java.util.List;

import com.couchbase.client.java.Bucket;
import com.couchbase.client.java.document.RawJsonDocument;
import com.couchbase.client.java.document.json.JsonObject;
import com.couchbase.client.java.query.N1qlQuery;
import com.couchbase.client.java.query.N1qlQueryResult;
import com.couchbase.client.java.query.N1qlQueryRow;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import com.fasterxml.jackson.databind.ObjectWriter;

public class TescoPlayService {
	

	
	public static TescoPlayResponse getPoints(String jsonString, Bucket bucket) throws Exception {
		
		TescoPlayResponse playResponse = new TescoPlayResponse();

		ObjectMapper mapper = new ObjectMapper();
		
		ObjectReader objectReader = mapper.readerFor(TescoPlayRequest.class);
		
		TescoPlayRequest tescoPlayRequest = objectReader.readValue(jsonString);
		
		CustomerPoints customerPoints = getCustomerDetails(tescoPlayRequest.getCustomerId(), bucket);
		
		if(customerPoints == null){
			playResponse.setCustomerId(tescoPlayRequest.getCustomerId());
			playResponse.setSuccess(false);
			playResponse.setErrorDesc("Customer Not found");
			return playResponse;
		}
	
		
		playResponse.setCustomerId(customerPoints.getCustomerId());
		playResponse.setPoints(customerPoints.getPoints());
		playResponse.setSuccess(true);
		return playResponse;

	}
	
	
	public static CustomerPoints getCustomerDetails(String customerId, Bucket bucket) throws Exception {
		
		ObjectMapper mapper = new ObjectMapper();
		
		ObjectReader objectReader = mapper.readerFor(CustomerPoints.class);
		
		RawJsonDocument jsonDocument = bucket.get(customerId, RawJsonDocument.class);
		
		
		if(jsonDocument == null){
			return null;
		}
		
		CustomerPoints customerPoints = objectReader.readValue(jsonDocument.content().toString());
	
		return customerPoints;
		
		
	}
	
	public static Promotion getPromotionDetails(String promoId, Bucket bucket) throws Exception {
		
		ObjectMapper mapper = new ObjectMapper();
		
		ObjectReader objectReader = mapper.readerFor(Promotion.class);
		
		RawJsonDocument jsonDocument = bucket.get(promoId, RawJsonDocument.class);
		
		
		if(jsonDocument == null){
			return null;
		}
		
		Promotion promotion = objectReader.readValue(jsonDocument.content().toString());
	
		return promotion;
		
		
	}
	
	public static Voucher getVoucherDetails(String promoId, Bucket bucket) throws Exception {
		
		ObjectMapper mapper = new ObjectMapper();
		
		ObjectReader objectReader = mapper.readerFor(Voucher.class);
		
		
		N1qlQueryResult result = bucket.query(N1qlQuery.simple("select * from tescoplay where type = 'voucher' and released = false and promoId = '"+promoId +"'"));
		
		
		if (result == null || !result.finalSuccess()) {
			System.out.println("null result");
			return null;
		}

		List<N1qlQueryRow> allVouchers =  result.allRows();
		
		JsonObject resultJson = null;
		
		JsonObject finalJson = null;
		
		for(N1qlQueryRow row : allVouchers){
			
			resultJson = row.value().getObject("tescoplay");
			
			if(!resultJson.getBoolean("released")){
				
				finalJson = resultJson;
				break;
			}
			
		}
		if(finalJson!=null){
			
			RawJsonDocument jsonDocument = bucket.get(finalJson.getString("voucherId"), RawJsonDocument.class);
			
			if(jsonDocument == null){
				return null;
			}
			
			Voucher voucher = objectReader.readValue(jsonDocument.content().toString());
			
			markVoucherAsReleased(voucher, bucket);
			
			return voucher;
			
		}else{
			return null;
		}
		
	}
	
	public static void markVoucherAsReleased(Voucher voucher, Bucket bucket) throws Exception{
		
		ObjectMapper mapper = new ObjectMapper();
		
		ObjectWriter objectWriter = mapper.writerFor(Voucher.class);
		
		voucher.setReleased(true);
		
		String createdJsonString = objectWriter.writeValueAsString(voucher); 
		
		RawJsonDocument jsonDocument = RawJsonDocument.create(voucher.getVoucherId(), createdJsonString);

		RawJsonDocument jsonDocumentCreated = bucket.upsert(jsonDocument);
		
	}
	
	public static TescoPlayResponse applyScore(String jsonString, Bucket bucket) throws Exception {
		
		TescoPlayResponse playResponse = new TescoPlayResponse();

		ObjectMapper mapper = new ObjectMapper();
		
		ObjectReader objectReader = mapper.readerFor(TescoPlayRequest.class);
		
		ObjectWriter objectWriter = mapper.writerFor(CustomerPoints.class);

		TescoPlayRequest tescoPlayRequest = objectReader.readValue(jsonString);
		
		CustomerPoints customerPoints = getCustomerDetails(tescoPlayRequest.getCustomerId(), bucket);
		
		if(customerPoints == null){
			
			playResponse.setCustomerId(tescoPlayRequest.getCustomerId());
			playResponse.setSuccess(false);
			playResponse.setErrorDesc("customer not found");
			
			return playResponse;
		}
		
		Promotion promotionDetails = getPromotionDetails(tescoPlayRequest.getPromoId(), bucket);
		
		if(promotionDetails == null){
			
			playResponse.setCustomerId(tescoPlayRequest.getCustomerId());
			playResponse.setSuccess(false);
			playResponse.setErrorDesc("promotion not applied");
			
			return playResponse;
		}
		
		if(promotionDetails.getPromotionType().equals("points")){
			
			long finalPoints = customerPoints.getPoints() +  tescoPlayRequest.getScore() * promotionDetails.getFactor();
			
			customerPoints.setPoints(finalPoints);

			String updatedJsonString = objectWriter.writeValueAsString(customerPoints);
			RawJsonDocument jsonDocument = RawJsonDocument.create(customerPoints.getCustomerId(), updatedJsonString);

			RawJsonDocument jsonDocumentUpdated = bucket.upsert(jsonDocument);
			
			if(jsonDocumentUpdated == null){
				playResponse.setCustomerId(tescoPlayRequest.getCustomerId());
				playResponse.setSuccess(false);
				playResponse.setErrorDesc("unable to apply score");
			}
			
			playResponse.setCustomerId(tescoPlayRequest.getCustomerId());
			playResponse.setSuccess(true);
			playResponse.setErrorDesc("successfully applied score to customer");
			playResponse.setAddedPoints(tescoPlayRequest.getScore() * promotionDetails.getFactor() );
			playResponse.setPoints(finalPoints);
			return playResponse;
			
		}else if(promotionDetails.getPromotionType().equals("voucher")){
			
			Voucher voucher = getVoucherDetails(promotionDetails.getPromotionId(), bucket);
			
			if(voucher !=null){
				playResponse.setCustomerId(tescoPlayRequest.getCustomerId());
				playResponse.setSuccess(true);
				playResponse.setErrorDesc("successfully applied score to customer");
				playResponse.setAddedPoints(0);
				playResponse.setPoints(0);
				playResponse.setVoucherCode(voucher.getVoucherCode());
				return playResponse;
				
			}else{
				playResponse.setCustomerId(tescoPlayRequest.getCustomerId());
				playResponse.setSuccess(false);
				playResponse.setErrorDesc("unable to apply score");
			}
			
		}
		
		return playResponse;
			

	}
	
	public static TescoPlayResponse createCustomer(String jsonString, Bucket bucket) throws Exception {
		
		TescoPlayResponse playResponse = new TescoPlayResponse();

		ObjectMapper mapper = new ObjectMapper();
		
		ObjectReader objectReader = mapper.readerFor(TescoPlayRequest.class);
		
		ObjectWriter objectWriter = mapper.writerFor(CustomerPoints.class);

		TescoPlayRequest tescoPlayRequest = objectReader.readValue(jsonString);
		
		
		CustomerPoints customerPoints = new CustomerPoints();
		
		customerPoints.setCustomerId(tescoPlayRequest.getCustomerId());
		
		customerPoints.setPoints(0);
		
		
		//CustomerPoints customerPoints = getCustomerDetails(tescoPlayRequest.getCustomerId(), bucket);
		
		
		String createdJsonString = objectWriter.writeValueAsString(customerPoints);
		RawJsonDocument jsonDocument = RawJsonDocument.create(customerPoints.getCustomerId(), createdJsonString);

		RawJsonDocument jsonDocumentCreated = bucket.upsert(jsonDocument);
		
		if(jsonDocumentCreated == null){
			playResponse.setCustomerId(tescoPlayRequest.getCustomerId());
			playResponse.setSuccess(false);
			playResponse.setErrorDesc("unable to create customer");
			
			return playResponse;
		}
		
		playResponse.setCustomerId(tescoPlayRequest.getCustomerId());
		playResponse.setSuccess(true);
		playResponse.setErrorDesc("successfully created customer");
		return playResponse;
			

	}
	
	
public static TescoPlayPromotionResponse createPromotion(String jsonString, Bucket bucket) throws Exception {
		
		TescoPlayPromotionResponse playPromoResponse = new TescoPlayPromotionResponse();

		ObjectMapper mapper = new ObjectMapper();
		
		ObjectReader objectReader = mapper.readerFor(TescoPlayPromotionRequest.class);
		
		ObjectWriter objectWriter = mapper.writerFor(Promotion.class);

		TescoPlayPromotionRequest tescoPlayPromotion = objectReader.readValue(jsonString);
		
		
		Promotion promotion = new Promotion();
		
		promotion.setPromotionId(tescoPlayPromotion.getPromotionId());
		
		promotion.setPromotionType(tescoPlayPromotion.getPromoType());
		
		promotion.setCalType(tescoPlayPromotion.getCalType());
		
		promotion.setFactor(tescoPlayPromotion.getFactor());
		
		
		
		String createdJsonString = objectWriter.writeValueAsString(promotion);
		RawJsonDocument jsonDocument = RawJsonDocument.create(promotion.getPromotionId(), createdJsonString);

		RawJsonDocument jsonDocumentCreated = bucket.upsert(jsonDocument);
		
		if(jsonDocumentCreated == null){
			playPromoResponse.setPromotionId(tescoPlayPromotion.getPromotionId());
			playPromoResponse.setSuccess(false);
			playPromoResponse.setDesc("unable to create promotion");
			
			return playPromoResponse;
		}
		
		playPromoResponse.setPromotionId(tescoPlayPromotion.getPromotionId());
		playPromoResponse.setSuccess(true);
		playPromoResponse.setDesc("promotion created successfully");
		
		return playPromoResponse;
			

	}


public static TescoPlayGameResponse createGame(String jsonString, Bucket bucket) throws Exception {
	
	TescoPlayGameResponse playGameResponse = new TescoPlayGameResponse();

	ObjectMapper mapper = new ObjectMapper();
	
	ObjectReader objectReader = mapper.readerFor(TescoPlayGameRequest.class);
	
	ObjectWriter objectWriter = mapper.writerFor(Game.class);

	TescoPlayGameRequest tescoPlayGameReq = objectReader.readValue(jsonString);
	
	
	Game game = new Game();
	
	game.setGameId(tescoPlayGameReq.getGameId());
	
	game.setUrl(tescoPlayGameReq.getUrl());
	
	game.setPromoId(tescoPlayGameReq.getPromotionId());
	
	game.setEnabled(tescoPlayGameReq.isEnabled());
	
	
	
	String createdJsonString = objectWriter.writeValueAsString(game);
	RawJsonDocument jsonDocument = RawJsonDocument.create(game.getGameId(), createdJsonString);

	RawJsonDocument jsonDocumentCreated = bucket.upsert(jsonDocument);
	
	if(jsonDocumentCreated == null){
		playGameResponse.setGameId(tescoPlayGameReq.getGameId());
		playGameResponse.setSuccess(false);
		playGameResponse.setDesc("unable to create game");
		
		return playGameResponse;
	}
	
	playGameResponse.setGameId(tescoPlayGameReq.getGameId());
	playGameResponse.setSuccess(true);
	playGameResponse.setDesc("game created successfully");
	
	return playGameResponse;
		

}

public static TescoPlayVoucherResponse createVoucher(String jsonString, Bucket bucket) throws Exception {
	
	TescoPlayVoucherResponse playGameVoucherResponse = new TescoPlayVoucherResponse();

	ObjectMapper mapper = new ObjectMapper();
	
	ObjectReader objectReader = mapper.readerFor(TescoPlayVoucherRequest.class);
	
	ObjectWriter objectWriter = mapper.writerFor(Voucher.class);

	TescoPlayVoucherRequest tescoPlayVoucherReq = objectReader.readValue(jsonString);
	
	
	Voucher voucher = new Voucher();
	
	voucher.setVoucherId(tescoPlayVoucherReq.getVoucherId());
	
	voucher.setVoucherCode(tescoPlayVoucherReq.getVoucherCode());
	
	voucher.setPromoId(tescoPlayVoucherReq.getPromoId());
	
	voucher.setReleased(tescoPlayVoucherReq.isReleased());
	
	
	String createdJsonString = objectWriter.writeValueAsString(voucher);
	RawJsonDocument jsonDocument = RawJsonDocument.create(voucher.getVoucherId(), createdJsonString);

	RawJsonDocument jsonDocumentCreated = bucket.upsert(jsonDocument);
	
	if(jsonDocumentCreated == null){
		playGameVoucherResponse.setVoucherId(tescoPlayVoucherReq.getVoucherId());
		playGameVoucherResponse.setSuccess(false);
		playGameVoucherResponse.setDesc("unable to create voucher");
		
		return playGameVoucherResponse;
	}
	
	playGameVoucherResponse.setVoucherId(tescoPlayVoucherReq.getVoucherId());
	playGameVoucherResponse.setSuccess(true);
	playGameVoucherResponse.setDesc("voucher created successfully");
	
	return playGameVoucherResponse;
		

}

public static TescoPlayGetGameResponse getGame(Bucket bucket) throws Exception {
	
	TescoPlayGetGameResponse playGetGameResponse = new TescoPlayGetGameResponse();
	
	N1qlQueryResult result = bucket.query(N1qlQuery.simple("select * from tescoplay where type = 'game' and enabled = true"));

	if (result == null || !result.finalSuccess()) {
		System.out.println("null result");
		return null;
	}

	List<N1qlQueryRow> allGames =  result.allRows();
	
	JsonObject resultJson = null;
	
	JsonObject finalJson = null;
	
	for(N1qlQueryRow row : allGames){
		
		resultJson = row.value().getObject("tescoplay");
		
		if(resultJson.getBoolean("enabled")){
			
			finalJson = resultJson;
			break;
		}
		
	}
	if(finalJson!=null){
		
		playGetGameResponse.setGameId(finalJson.getString("gameId"));
		playGetGameResponse.setPromotionId(finalJson.getString("promoId"));
		playGetGameResponse.setUrl(finalJson.getString("url"));
		playGetGameResponse.setSuccess(true);
		playGetGameResponse.setDesc("enabled game found");
		
	}else{
		
		playGetGameResponse.setSuccess(false);
		playGetGameResponse.setDesc("enabled game not found or no games found");
	}
	return playGetGameResponse;
		

}

}
