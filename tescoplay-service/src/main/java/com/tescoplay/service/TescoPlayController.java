package com.tescoplay.service;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.couchbase.client.java.Bucket;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
public class TescoPlayController {
	
	private static Bucket bucket;
	
	public static void shutdown() throws IOException {

		
		System.exit(0);

	}
	
	public TescoPlayController(){
		
		bucket = ConnectionBuilder.getBucket();
		
	}
	
	
	@PostMapping("/applyScore")
	public ResponseEntity handleApplyScore(HttpServletRequest request, HttpServletResponse response,@RequestBody TescoPlayRequest tescoPlayRequest) {
		
		ObjectMapper mapper = new ObjectMapper();
		
		TescoPlayResponse playResponse = null;
		
		try {
			String jsonStr = mapper.writeValueAsString(tescoPlayRequest);
			
		  playResponse = TescoPlayService.applyScore(jsonStr, bucket);
			
			
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		if(playResponse.isSuccess()){
			
			return new ResponseEntity(playResponse, HttpStatus.OK);
			
		}else{
			return new ResponseEntity(playResponse, HttpStatus.OK);
		}
		

	}
	
	@PostMapping("/getPoints")
	public ResponseEntity handleGetPoints(HttpServletRequest request, HttpServletResponse response,@RequestBody TescoPlayRequest tescoPlayRequest) {
		
		ObjectMapper mapper = new ObjectMapper();
		
		try {
			String jsonStr = mapper.writeValueAsString(tescoPlayRequest);
			
			TescoPlayResponse playResponse = TescoPlayService.getPoints(jsonStr, bucket);
			
			if(playResponse == null){
				return new ResponseEntity("No Customer found", HttpStatus.NOT_FOUND);
			}
			
			return new ResponseEntity(playResponse, HttpStatus.OK);
			
			
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;

	}
	
	@PostMapping("/createCustomerPoints")
	public ResponseEntity handleCreateCustomerPoints(HttpServletRequest request, HttpServletResponse response,@RequestBody TescoPlayRequest tescoPlayRequest) {
		
		ObjectMapper mapper = new ObjectMapper();
		
		TescoPlayResponse playResponse = null;
		
		try {
			String jsonStr = mapper.writeValueAsString(tescoPlayRequest);
			
		  playResponse = TescoPlayService.createCustomer(jsonStr, bucket);
			
			
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		if(playResponse.isSuccess()){
			
			return new ResponseEntity(playResponse, HttpStatus.OK);
			
		}else{
			return new ResponseEntity(playResponse, HttpStatus.OK);
		}
	}
	
	@PostMapping("/createPromotion")
	public ResponseEntity handleCreatePromotion(HttpServletRequest request, HttpServletResponse response,@RequestBody TescoPlayPromotionRequest tescoPlayPromotion) {
		
		ObjectMapper mapper = new ObjectMapper();
		
		TescoPlayPromotionResponse playResponse = null;
		
		try {
			String jsonStr = mapper.writeValueAsString(tescoPlayPromotion);
			
		  playResponse = TescoPlayService.createPromotion(jsonStr, bucket);
			
			
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		if(playResponse.isSuccess()){
			
			return new ResponseEntity(playResponse, HttpStatus.OK);
			
		}else{
			return new ResponseEntity(playResponse, HttpStatus.OK);
		}
	}
	
	@PostMapping("/createGame")
	public ResponseEntity handleCreateGame(HttpServletRequest request, HttpServletResponse response,@RequestBody TescoPlayGameRequest tescoPlayGameReq) {
		
		ObjectMapper mapper = new ObjectMapper();
		
		TescoPlayGameResponse playResponse = null;
		
		try {
			String jsonStr = mapper.writeValueAsString(tescoPlayGameReq);
			
		  playResponse = TescoPlayService.createGame(jsonStr, bucket);
			
			
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		if(playResponse.isSuccess()){
			
			return new ResponseEntity(playResponse, HttpStatus.OK);
			
		}else{
			return new ResponseEntity(playResponse, HttpStatus.OK);
		}
	}
	
	@PostMapping("/createVoucher")
	public ResponseEntity handleCreateVoucher(HttpServletRequest request, HttpServletResponse response,@RequestBody TescoPlayVoucherRequest tescoPlayVoucherReq) {
		
		ObjectMapper mapper = new ObjectMapper();
		
		TescoPlayVoucherResponse playResponse = null;
		
		try {
			String jsonStr = mapper.writeValueAsString(tescoPlayVoucherReq);
			
		  playResponse = TescoPlayService.createVoucher(jsonStr, bucket);
			
			
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		if(playResponse.isSuccess()){
			
			return new ResponseEntity(playResponse, HttpStatus.OK);
			
		}else{
			return new ResponseEntity(playResponse, HttpStatus.OK);
		}
	}
	
	@RequestMapping("/getGame")
	public ResponseEntity handleGetGame(HttpServletRequest request, HttpServletResponse response) {
		
		
		TescoPlayGetGameResponse playResponse = null;
		
		try {
			
		  playResponse = TescoPlayService.getGame(bucket);
			
			
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		if(playResponse.isSuccess()){
			
			return new ResponseEntity(playResponse, HttpStatus.OK);
			
		}else{
			return new ResponseEntity(playResponse, HttpStatus.OK);
		}
	}
	
	
}
