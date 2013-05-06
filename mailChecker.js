/**
 *	Mailcheck for China
 *	Modified by Daniel Yang
 *	
 *	Aim to provide a good Mailcheck for Chinese
 *	
 *	Thanks Derrick Ko (@derrickko)
 **/
/*
 * Mailcheck https://github.com/Kicksend/mailcheck
 * Author
 * Derrick Ko (@derrickko)
 *
 * License
 * Copyright (c) 2012 Receivd, Inc.
 *
 * Licensed under the MIT License.
 *
 * v 1.1
 */
(function(factory){

	if(define){
		define(factory);
	}else{
		this.mailCheck = factory();
	}

})(function(){
	
	var threshold = 3,
		domains = [
					"hotmail.com",
					"gmail.com",
					"me.com",
					"mac.com",
					"live.com",
					"msn.com",
					"qq.com",
					"163.com",
					"sina.com"
				  ],
		topLevelDomains = [
							"com.cn", 
							"com", 
							"net", 
							"org", 
							"info", 
							"edu", 
							"gov", 
							"cn"
						  ];
		
	function _splitEmail(email){
		var parts = email.split('@'),
			i;

		if(parts.length < 2) {
			return false;
		}

		for(i = parts.length; i--;) {
			if(parts[i] === '') {
				return false;
			}
		}

		var domain = parts.pop(),
			domainParts = domain.split('.'),
			tld = '';

		if (domainParts.length == 0) {
			return false;
		}else if(domainParts.length == 1) {
			tld = domainParts[0];
		}else{
			for(i = 1; i < domainParts.length; i++) {
				tld += domainParts[i] + '.';
			}
			if (domainParts.length >= 2) {
				tld = tld.substring(0, tld.length - 1);
			}
		}

		return {
			topLevelDomain: tld,
			domain: domain,
			address: parts.join('@')
		};
	}
	
	function _findClosestDomain(domain, domains) {
		var dist,
			i,
			minDist = 99,
			closestDomain;

		if(!domain || !domains) {
			return false;
		}

		for(i = domains.length; i--;) {
			if(domain === domains[i]){
				return domain;
			}
			dist = _sift3Distance(domain, domains[i]);
			if(dist < minDist){
				minDist = dist;
				closestDomain = domains[i];
			}
		}

		if(minDist <= threshold && closestDomain) {
			return closestDomain;
		}else{
			return false;
		}
	}
	
	function _sift3Distance(s1, s2){
		// sift3: http://siderite.blogspot.com/2007/04/super-fast-and-accurate-string-distance.html
		if (!s1 || s1.length === 0){
			if (!s2 || s2.length === 0){
				return 0;
			}else{
				return s2.length;
			}
		}

		if(!s2|| s2.length === 0){
			return s1.length;
		}

		var c = 0,
			offset1 = 0,
			offset2 = 0,
			lcs = 0,
			maxOffset = 5;

		while((c + offset1 < s1.length) && (c + offset2 < s2.length)){
			if(s1.charAt(c + offset1) == s2.charAt(c + offset2)){
				lcs++;
			}else{
				offset1 = 0;
				offset2 = 0;
				for (var i = 0; i < maxOffset; i++) {
					if ((c + i < s1.length) && (s1.charAt(c + i) == s2.charAt(c))){
						offset1 = i;
						break;
					}
					if ((c + i < s2.length) && (s1.charAt(c) == s2.charAt(c + i))) {
						offset2 = i;
						break;
					}
				}
			}
			c++;
		}
		return (s1.length + s2.length) /2 - lcs;
	}
	
	function suggest(email){
		email = encodeURI(email).toLowerCase();
		
		var emailParts = _splitEmail(email),
			closestDomain = _findClosestDomain(emailParts.domain, domains),
			closestTopLevelDomain,
			domain;
			
		if(closestDomain){
			if(closestDomain != emailParts.domain) {
				return { 
					address: emailParts.address, 
					domain: closestDomain, 
					full: emailParts.address + "@" + closestDomain 
				};
			}
		}else{
			closestTopLevelDomain = _findClosestDomain(emailParts.topLevelDomain, topLevelDomains);
			if(emailParts.domain && closestTopLevelDomain && closestTopLevelDomain != emailParts.topLevelDomain){
				domain = emailParts.domain;
				closestDomain = domain.substring(0, domain.lastIndexOf(emailParts.topLevelDomain)) + closestTopLevelDomain;
				return { 
					address: emailParts.address, 
					domain: closestDomain, 
					full: emailParts.address + "@" + closestDomain 
				};
			}
		}
		
		return false;
	}

	return {
		check: check,
		suggest: suggest
	};
});