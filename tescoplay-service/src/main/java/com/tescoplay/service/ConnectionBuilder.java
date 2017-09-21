/**
 * @author fb25
 *
 */
package com.tescoplay.service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import com.couchbase.client.java.Bucket;
import com.couchbase.client.java.CouchbaseCluster;
import com.couchbase.client.java.env.CouchbaseEnvironment;
import com.couchbase.client.java.env.DefaultCouchbaseEnvironment;

public class ConnectionBuilder {

	private static CouchbaseCluster cluster = null;
	
	private static Bucket bucket = null;

	private ConnectionBuilder() {

	}

	
	public static Bucket getBucket() {

		if (cluster == null) {

			CouchbaseEnvironment env = DefaultCouchbaseEnvironment.builder().kvTimeout(60000).connectTimeout(60000).computationPoolSize(16)
					.build();

			List<String> couchbaseAddresses = new ArrayList<String>();
			
			couchbaseAddresses.add("127.0.0.1");
			
			cluster = CouchbaseCluster.create(env, couchbaseAddresses);
		}

		if (bucket == null) {
			
				bucket = cluster.openBucket("tescoplay", "password", 1,
						TimeUnit.MINUTES);
		}

		return bucket;

	}

	public static void closeBucket() {

		if (bucket != null) {
			bucket.close();
		}

		if (cluster != null) {
			cluster.disconnect();
		}

	}

	

	public static CouchbaseCluster getCluster() {
		return cluster;
	}

	public static void setCluster(CouchbaseCluster cluster) {
		ConnectionBuilder.cluster = cluster;
	}


	public static void setBucket(Bucket bucket) {
		ConnectionBuilder.bucket = bucket;
	}

}
