const customTransforms = {
  'test3': (obj, params) => {
    console.log(obj.src);
    console.log(obj.dst);
    console.log(params);
    return obj;
  },
  'hero': (obj, params) => {

    obj.dst.title = obj.dst.title;
    obj.dst.subTitle = obj.dst.subTitle;
    obj.dst.coverImage = obj.dst.cover !== undefined ? 
                          obj.dst.cover[0] !== undefined ? obj.dst.cover[0].url.replace('medium', 'large') : undefined
                            : undefined;

    var heroTitle = '';
    var locations = [];
    obj.dst.Informatie
    for(const extraFieldValue of obj.dst.extraFieldValues) {
      for (const field of extraFieldValue.fields) {
        if (field.name == 'bestemming1' || field.name == 'bestemming2' || field.name == 'bestemming3' || field.name == 'bestemming4') {
          if(field.value) {
            //heroTitle += ' ' + field.value;

            locations.push(field.value);

          }
        } else if (field.name == 'Informatie') {
          obj.dst.Informatie = field.value;
        }
      }
    }
    
    for(var i=0; i<locations.length; i++) {
      if( i == 0) {
        heroTitle += locations[i];
      } else if(locations.length - 1 == i) {
        heroTitle += ' & ' + locations[i];
      } else {
        heroTitle += ', ' + locations[i];
      }
    }
    obj.dst.heroTitle = heroTitle;

    obj.dst.noOfParticipants = obj.dst.participants['party 1'].length;
    
    obj.dst.mainBooker = '';
    if (obj.dst.participants['party 1'][0] !== undefined) {
        obj.dst.mainBooker += obj.dst.participants['party 1'][0].name + ' ' + obj.dst.participants['party 1'][0].surname;
    }

    var numberOfDays = function() {
      var startDate = new Date(obj.dst.startDate);
      var endDate = new Date(obj.dst.endDate);

      return Math.round( (endDate.getTime() - startDate.getTime())/(1000 * 60 * 60 * 24 ) );

    }
    obj.dst.numberOfDays = numberOfDays();

    
    return obj;
  },
  'hotels': (obj, params) => {
    var hotels =[];
    for(const seg of obj.dst.segments) {
      for(const el of seg.elements) {
        if(el.unitId == 2 && !el.optional) {
          let image = el.media[0] !== undefined ? el.media[0].url : undefined;
          var data = {title: el.title, additionalTaxt: el.additionalText, image: image};
          hotels.push(data);
        }
      }
    }
    obj.dst.hotels = hotels;
    return obj;
  },
  'gallery': (obj, params) => {

    tips = [];
    for(const seg of obj.dst.segments) {
      for(const el of seg.elements) {
        if(el.optional == true && (el.unitId == 2 || el.unitId == 5)) {
          for(const ele of seg.elements) {
            if(el.unitId == ele.unitId) {
              el.olPrices.salesTotal = ((Math.round(ele.olPrices.salesTotal) - Math.round(el.olPrices.salesTotal))/Object.keys(el.olPrices.participants).length);
              tips.push(el);
              break;
            }
          }
        }
      }
    }

    obj.dst.tips = tips;

    return obj;
  },
  'map': (obj, params) => {

    markers = [];
    let i = 1;
    for (const seg of obj.dst.segments) {
      for (const element of seg.elements) {
        if (element.maps) {
          
          if (element.maps.latitude) {
            Object.assign(element.maps, {title:element.title, id: i.toString()});
            markers.push(element.maps);
            i++;
          }
        }
      }  
    }
    
    obj.dst.markers = markers;

    return obj;
  },
  'mapInfo': (obj, params) => {

    titles = [];
    
    for(const segment of obj.dst.segments) {

      if(segment.typeId == 16) {
        var data = { day: segment.day, title: segment.title};
        titles.push(data);

      }
    }

    obj.dst.titles = titles;
    return obj;
  },
  'cost': (obj, params) => {

    var flightPrice = 0;
    var otherCost = 0;
    var totalCost = 0;
    var remainingPrice = [];
    var insurancesPrice = 0;
    for(const segment of obj.dst.segments) {

      for(const element of segment.elements) {

        if((segment.typeId == 16 || segment.typeId == 6) && element.optional==false) {
          otherCost += Math.round(element.olPrices.salesTotal);
        } else if (segment.typeId == 17 && element.optional==false) {
          remainingPrice.push({ 'title': element.title, 'price': Math.round(element.olPrices.salesTotal)});
          totalCost += Math.round(element.olPrices.salesTotal);
        } else if (segment.typeId == 4 && element.optional==false) {
          flightPrice += Math.round(element.olPrices.salesTotal);
        } else if (segment.typeId == 7 && element.optional==false) {
          insurancesPrice += Math.round(element.olPrices.salesTotal);
        }

      }

    }
    obj.dst.flightPrice = Number(flightPrice.toFixed(2)).toLocaleString('nl');
    obj.dst.otherCost = Number(otherCost.toFixed(2)).toLocaleString('nl');
    obj.dst.insurancesPrice = Number(insurancesPrice.toFixed(2)).toLocaleString('nl');
    obj.dst.remainingPrice = remainingPrice;

    obj.dst.totalCost = Number((flightPrice + otherCost + insurancesPrice + totalCost).toFixed(2)).toLocaleString('nl');;
    return obj;
  },
  'inclusive': (obj, params) => {

    includedStrings = [];
    finalConsultants = [];
    consultants = [
      {
        name : 'Kim Marokko',
        email: '',
        phone: '',
        title: 'Ik ben afgestudeerd aan de Hogeschool IN-Holland en heb zowel mijn stage als mijn afstudeerproject bij OutSight voltooid. Na mijn afstuderen heb ik voor OutSight de bestemmingen Marokko en Turkije opgezet. De afgelopen jaren heb ik gereisd door Marokko, Turkije, Thailand, Laos, Cambodja & Vietnam, Maleisië, Madagaskar, Mexico & Guatemala, Nicaragua, Colombia, Argentinië & Chili en Tanzania. Vorig jaar was ik in Nepal & Maleisië, dit jaar in Indonesië, Ecuador en Zuid-Afrika! De foto is gemaakt op Durban Square in Kathmandu, Nepal',
        picture: 'assets/images/Kim Marokko.JPG',
      },
      {
        name : 'Saskia',
        email: '',
        phone: '',
        title: 'Ik heb mijn toeristische opleiding gevolgd aan de Hogeschool IN Holland, heb mijn stage gedaan bij OutSight en ben nooit meer weggegaan! Ik hou vooral van Azie. Als tijdens mijn studie heb ik een reis naar China gemaakt en de afgelopen jaren bezocht ik Costa Rica, China, Tibet, Suriname, India, Nepal, Jordanië, Marokko, Myanmar, Sri Lanka & de Malediven, Japan en Bali. In 2017 was ik in het zuiden van India en in Zuid-Korea, in 2018 heb ik een reis naar Japan gemaakt en in 2019 naar Taiwan. Deze foto is gemaakt in Tibet op de route tussen Sakya en Rombuk bij een van de vele hooggelegen passen.',
        picture: 'assets/images/Saskia.JPG',
      },
      {
        name : 'Florine',
        email: '',
        phone: '',
        title: 'Ik heb mijn HTRO diploma behaald bij INHolland Diemen, en ben met mijn diploma op zak vijf maanden gaan backpacken door Azië. Tijdens deze reis heb ik zes verschillende landen bezocht: Thailand, Vietnam, Maleisië (Borneo), de Filipijnen, Japan en Myanmar. Ook heb ik reizen gemaakt naar Costa Rica, Indonesië, Mexico, Laos & Cambodja en de westkust van Amerika. Vorig jaar was ik in Sri Lanka én Brazilië en later dit jaar ga ik naar Zuid-Afrika! Ik hou vooral van Azie, en dat komt ook door het eten!',
        picture: 'https://media.outsight.nl/original/original/Florine-Sri-Lanka.jpg',
      }
    ];
    
    for( const data of obj.dst.extraFieldValues ){
      
      if (data.name == 'Included') {
        for(const f of data.fields) {
          if(f.value !== undefined) {
            if(f.value != true && f.value != '') {
              includedStrings.push({ name:f.value });
            } else {
              includedStrings.push({ name:f.name });
            }

          } else {
            includedStrings.push({ name:f.name });
          }
          
        }
      }

      for(const fielddata of data.fields) {
        consultData = fielddata.value;
        
        if (fielddata.name == 'reisspecialist') {
          for(const j of consultants ) {
            if (fielddata.value.indexOf(j.name) !== -1) {
              finalConsultants.push(j);
            }
          } 
        }
      }
     
    }

    obj.dst.includedStrings = includedStrings;
    obj.dst.finalConsultants = finalConsultants;
    
    return obj;
  },
  'excluding': (obj, params) => {

    excludedStrings = [];
    for( const data of obj.dst.extraFieldValues ) {
      
      if (data.name == 'Not included') {
        for(const f of data.fields) {
          if(f.value !== undefined) {
            if(f.value != true && f.value != '') {
              excludedStrings.push({ name:f.value });
            } else {
              excludedStrings.push({ name:f.name });
            }

          } else {
            excludedStrings.push({ name:f.name });
          }
        }
      }

    }

    obj.dst.excludedStrings = excludedStrings;

    return obj;
  },
  'overview': (obj, params) => {

    //obj.dst.propsal = obj.dst.TSOrder.texts.proposal; fix later
    homeTitles = [];
    months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'];
    
    var startDate = new Date(obj.dst.startDate);
    /*
    for(const segment of obj.dst.segments) {
      
      
      var date = new Date(startDate);
      date.setDate(date.getDate() + segment.day);

      var myNewDate = new Date(date);
     
      var dateString = date.getDate() + '-' + months[date.getMonth()];
      
      var data = { date: dateString, title: segment.title };
      homeTitles.push(data);

      for(const element of segment.elements) {
        var data = { date: dateString, title: element.title };
        homeTitles.push(data);
      }
      
    }
    */
    for(const segment of obj.dst.segments) {

      var date = new Date(startDate);
      date.setDate(date.getDate() + segment.day);

      var myNewDate = new Date(date);

      var dateString = date.getDate() + '-' + months[date.getMonth()];

      if(segment.typeId == 16) {

        var data = { date: dateString, title: segment.title};
        homeTitles.push(data);

      }
    }
    obj.dst.homeTitles = homeTitles;

    return obj;
  },
  'tripDays': (obj, params) => {

    tripTitles = [];
    for(const segment of obj.dst.segments) {
      if(segment.typeId == 16) {
        var mediaURL = '';
        if(segment.media[0] !== undefined) {
          mediaURL = segment.media[0].url;
        } else {
          mediaURL = 'https://via.placeholder.com/300';
        }

        var data = { startDay: segment.day, endDay: segment.day + segment.nights, title: segment.title, content: segment.content, media:mediaURL};
        tripTitles.push(data);
      }
    }

    obj.dst.tripTitles = tripTitles;

    return obj;
  },
  'extraInfo': (obj, params) => {

    //obj.dst.general = obj.dst.TSOrder.texts.general; fix later

    return obj;
  },
  'flights': (obj, params) => {

    airlineCodes = 
    [{"airline":"1Time Airline","carrier_code":"1T"},{"airline":"40-Mile Air","carrier_code":"Q5"},{"airline":"Ansett Australia","carrier_code":"AN"},{"airline":"Abacus International","carrier_code":"1B"},{"airline":"Abelag Aviation","carrier_code":"W9"},{"airline":"Aigle Azur","carrier_code":"ZI"},{"airline":"Aloha Airlines","carrier_code":"AQ"},{"airline":"American Airlines","carrier_code":"AA"},{"airline":"Asiana Airlines","carrier_code":"OZ"},{"airline":"Askari Aviation","carrier_code":"4K"},{"airline":"Afriqiyah Airways","carrier_code":"8U"},{"airline":"Afrinat International Airlines","carrier_code":"Q9"},{"airline":"Allegiant Air","carrier_code":"G4"},{"airline":"Aban Air","carrier_code":"K5"},{"airline":"ABSA - Aerolinhas Brasileiras","carrier_code":"M3"},{"airline":"Antrak Air","carrier_code":"04"},{"airline":"Airborne Express","carrier_code":"GB"},{"airline":"ABX Air","carrier_code":"GB"},{"airline":"Astral Aviation","carrier_code":"8V"},{"airline":"Aero Asia International","carrier_code":"E4"},{"airline":"Air Togo","carrier_code":"YT"},{"airline":"Advance Leasing Company","carrier_code":"4G"},{"airline":"Aztec Worldwide Airlines","carrier_code":"7A"},{"airline":"Air Tindi","carrier_code":"8T"},{"airline":"Ada Air","carrier_code":"ZY"},{"airline":"ADC Airlines","carrier_code":"Z7"},{"airline":"Adria Airways","carrier_code":"JP"},{"airline":"Air Europa","carrier_code":"UX"},{"airline":"Aero Benin","carrier_code":"EM"},{"airline":"Aegean Airlines","carrier_code":"A3"},{"airline":"Air Atlantique","carrier_code":"KI"},{"airline":"Air Europe","carrier_code":"PE"},{"airline":"Alaska Central Express","carrier_code":"KO"},{"airline":"Astraeus","carrier_code":"5W"},{"airline":"Aerosvit Airlines","carrier_code":"VV"},{"airline":"Air Italy","carrier_code":"I9"},{"airline":"American Falcon","carrier_code":"WK"},{"airline":"Alliance Airlines","carrier_code":"QQ"},{"airline":"Ariana Afghan Airlines","carrier_code":"FG"},{"airline":"Aeroflot Russian Airlines","carrier_code":"SU"},{"airline":"Air Bosna","carrier_code":"JA"},{"airline":"Air France","carrier_code":"AF"},{"airline":"Air Caledonie International","carrier_code":"SB"},{"airline":"Air Gabon","carrier_code":"GN"},{"airline":"Air Salone","carrier_code":"2O"},{"airline":"Air Cargo Carriers","carrier_code":"2Q"},{"airline":"Air Senegal International","carrier_code":"V7"},{"airline":"Air Namibia","carrier_code":"SW"},{"airline":"Air Service Gabon","carrier_code":"G8"},{"airline":"Aerolitoral","carrier_code":"5D"},{"airline":"Amadeus Global Travel Distribution","carrier_code":"1A"},{"airline":"Air Glaciers","carrier_code":"7T"},{"airline":"Aeroper","carrier_code":"PL"},{"airline":"Atlas Blue","carrier_code":"8A"},{"airline":"Air Alpha Greenland","carrier_code":"GD"},{"airline":"Air Hong Kong","carrier_code":"LD"},{"airline":"Aeromist-Kharkiv","carrier_code":"HT"},{"airline":"Azerbaijan Airlines","carrier_code":"J2"},{"airline":"Avies","carrier_code":"U3"},{"airline":"Airbus Industrie","carrier_code":"AP"},{"airline":"Alpine Air Express","carrier_code":"5A"},{"airline":"Airblue","carrier_code":"ED"},{"airline":"Air Berlin","carrier_code":"AB"},{"airline":"Air Contractors","carrier_code":"AG"},{"airline":"Air India Limited","carrier_code":"AI"},{"airline":"Air Bourbon","carrier_code":"ZB"},{"airline":"Air Atlanta Icelandic","carrier_code":"CC"},{"airline":"Air Srpska","carrier_code":"RB"},{"airline":"Air Tahiti Nui","carrier_code":"TN"},{"airline":"Aero Services Executive","carrier_code":"W4"},{"airline":"Arkia Israel Airlines","carrier_code":"IZ"},{"airline":"Air Jamaica","carrier_code":"JM"},{"airline":"Air One","carrier_code":"AP"},{"airline":"Air Sahara","carrier_code":"S2"},{"airline":"Air Malta","carrier_code":"KM"},{"airline":"Amerijet International","carrier_code":"M6"},{"airline":"Air Japan","carrier_code":"NQ"},{"airline":"Air Kiribati","carrier_code":"4A"},{"airline":"Air Nippon Network Co. Ltd.","carrier_code":"EH"},{"airline":"America West Airlines","carrier_code":"HP"},{"airline":"Air Wisconsin","carrier_code":"ZW"},{"airline":"Tatarstan Airlines","carrier_code":"U9"},{"airline":"Air Libert","carrier_code":"VD"},{"airline":"Air Lithuania","carrier_code":"TT"},{"airline":"Air Malawi","carrier_code":"QM"},{"airline":"Air Sicilia","carrier_code":"BM"},{"airline":"Air Macau","carrier_code":"NX"},{"airline":"Air Midwest","carrier_code":"ZV"},{"airline":"Air Seychelles","carrier_code":"HM"},{"airline":"AeroM\u00e9xico","carrier_code":"AM"},{"airline":"All Nippon Airways","carrier_code":"NH"},{"airline":"Air Nostrum","carrier_code":"YW"},{"airline":"Air Niugini","carrier_code":"PX"},{"airline":"Air Arabia","carrier_code":"G9"},{"airline":"Air Canada","carrier_code":"AC"},{"airline":"Air Baltic","carrier_code":"BT"},{"airline":"Air Nippon","carrier_code":"EL"},{"airline":"Airnorth","carrier_code":"TL"},{"airline":"Air North Charter - Canada","carrier_code":"4N"},{"airline":"AOM French Airlines","carrier_code":"IW"},{"airline":"Air New Zealand","carrier_code":"NZ"},{"airline":"AVCOM","carrier_code":"J6"},{"airline":"Aero VIP","carrier_code":"2D"},{"airline":"Air Vegas","carrier_code":"6V"},{"airline":"Alitalia Express","carrier_code":"XM"},{"airline":"Asia Overnight Express","carrier_code":"OE"},{"airline":"Aero Flight","carrier_code":"GV"},{"airline":"Arrow Air","carrier_code":"JW"},{"airline":"Arik Air","carrier_code":"W3"},{"airline":"Aerocondor","carrier_code":"2B"},{"airline":"Aires","carrier_code":"4C"},{"airline":"Aerolineas Argentinas","carrier_code":"AR"},{"airline":"Air Armenia","carrier_code":"QN"},{"airline":"Alaska Airlines","carrier_code":"AS"},{"airline":"Air Sinai","carrier_code":"4D"},{"airline":"Airstars","carrier_code":"PL"},{"airline":"Atlantic Southeast Airlines","carrier_code":"EV"},{"airline":"Astrakhan Airlines","carrier_code":"OB"},{"airline":"Air Tanzania","carrier_code":"TC"},{"airline":"Air Burkina","carrier_code":"2J"},{"airline":"Aero-Tropics Air Services","carrier_code":"HC"},{"airline":"Airlines Of Tasmania","carrier_code":"FO"},{"airline":"Air Saint Pierre","carrier_code":"PJ"},{"airline":"Air Transport International","carrier_code":"8C"},{"airline":"Austrian Airlines","carrier_code":"OS"},{"airline":"Augsburg Airways","carrier_code":"IQ"},{"airline":"AirBridge Cargo","carrier_code":"RU"},{"airline":"Abu Dhabi Amiri Flight","carrier_code":"MO"},{"airline":"Aeroflot-Nord","carrier_code":"5N"},{"airline":"Aurigny Air Services","carrier_code":"GR"},{"airline":"Aus-Air","carrier_code":"NO"},{"airline":"Austral Lineas Aereas","carrier_code":"AU"},{"airline":"Australian Airlines","carrier_code":"AO"},{"airline":"Avianca - Aerovias Nacionales de Colombia","carrier_code":"AV"},{"airline":"Air Vanuatu","carrier_code":"NF"},{"airline":"Airlink Zambia","carrier_code":"K8"},{"airline":"Air Bangladesh","carrier_code":"B9"},{"airline":"Air Mediterranee","carrier_code":"DR"},{"airline":"Aeroline GmbH","carrier_code":"7E"},{"airline":"Air Wales","carrier_code":"6G"},{"airline":"Air Cara\u00efbes","carrier_code":"TX"},{"airline":"Air India Express","carrier_code":"IX"},{"airline":"Asian Express Airlines","carrier_code":"HJ"},{"airline":"Air Exel","carrier_code":"XT"},{"airline":"AirAsia","carrier_code":"AK"},{"airline":"Axis Airways","carrier_code":"6V"},{"airline":"Atlant-Soyuz Airlines","carrier_code":"3G"},{"airline":"Alitalia","carrier_code":"AZ"},{"airline":"Arcus-Air Logistic","carrier_code":"ZE"},{"airline":"Amaszonas","carrier_code":"Z8"},{"airline":"Air Zimbabwe","carrier_code":"UM"},{"airline":"Aserca Airlines","carrier_code":"R7"},{"airline":"Rossiya-Russian Airlines","carrier_code":"FV"},{"airline":"Aviaexpress","carrier_code":"RX"},{"airline":"American Eagle Airlines","carrier_code":"MQ"},{"airline":"Airshop","carrier_code":"FF"},{"airline":"African Transport Trading and Investment Company","carrier_code":"ML"},{"airline":"Air Ivoire","carrier_code":"VU"},{"airline":"Air Botswana","carrier_code":"BP"},{"airline":"Air Foyle","carrier_code":"GS"},{"airline":"Air Tahiti","carrier_code":"VT"},{"airline":"Air Urga","carrier_code":"3N"},{"airline":"Air VIA","carrier_code":"VL"},{"airline":"Africa West","carrier_code":"FK"},{"airline":"Avirex","carrier_code":"G2"},{"airline":"ATRAN Cargo Airlines","carrier_code":"V8"},{"airline":"Avensa","carrier_code":"VE"},{"airline":"Avolar Aerolineas","carrier_code":"V5"},{"airline":"Air China","carrier_code":"CA"},{"airline":"Aero Condor Peru","carrier_code":"Q6"},{"airline":"Arctic Circle Air Service","carrier_code":"5F"},{"airline":"Air Corridor","carrier_code":"QC"},{"airline":"Air Central","carrier_code":"NV"},{"airline":"Air Chathams","carrier_code":"CV"},{"airline":"Air Marshall Islands","carrier_code":"CW"},{"airline":"Access Air","carrier_code":"ZA"},{"airline":"Air Algerie","carrier_code":"AH"},{"airline":"Adam Air","carrier_code":"KI"},{"airline":"Astar Air Cargo","carrier_code":"ER"},{"airline":"Antinea Airlines","carrier_code":"HO"},{"airline":"Air Dolomiti","carrier_code":"EN"},{"airline":"Aeroflot-Don","carrier_code":"D9"},{"airline":"Air Madrid","carrier_code":"NM"},{"airline":"Aero Airlines","carrier_code":"EE"},{"airline":"Air City","carrier_code":"4F"},{"airline":"Aer Lingus","carrier_code":"EI"},{"airline":"Alpi Eagles","carrier_code":"E8"},{"airline":"Air S","carrier_code":"KY"},{"airline":"Air Fiji","carrier_code":"PC"},{"airline":"Air Finland","carrier_code":"OF"},{"airline":"Air Pacific","carrier_code":"FJ"},{"airline":"Atlantic Airways","carrier_code":"RC"},{"airline":"Air Florida","carrier_code":"QH"},{"airline":"Air Iceland","carrier_code":"NY"},{"airline":"Air Philippines","carrier_code":"2P"},{"airline":"Air Georgian","carrier_code":"ZX"},{"airline":"Air Guinee Express","carrier_code":"2U"},{"airline":"Amber Air","carrier_code":"0A"},{"airline":"Air Georgia","carrier_code":"DA"},{"airline":"Air Greenland","carrier_code":"GL"},{"airline":"Allegro","carrier_code":"LL"},{"airline":"Atlas Air","carrier_code":"5Y"},{"airline":"Air Guyane","carrier_code":"GG"},{"airline":"Air D'Ayiti","carrier_code":"H9"},{"airline":"Air Comores International","carrier_code":"GG"},{"airline":"Air Horizon","carrier_code":"8C"},{"airline":"Air Bagan","carrier_code":"W9"},{"airline":"Atyrau Air Ways","carrier_code":"IP"},{"airline":"Air Canada Jazz","carrier_code":"QK"},{"airline":"Atlasjet","carrier_code":"KK"},{"airline":"Air Koryo","carrier_code":"JS"},{"airline":"Air Astana","carrier_code":"KC"},{"airline":"Albanian Airlines","carrier_code":"LV"},{"airline":"Alidaunia","carrier_code":"D4"},{"airline":"Alliance Air","carrier_code":"CD"},{"airline":"Aerolane","carrier_code":"XL"},{"airline":"Air Alps Aviation","carrier_code":"A6"},{"airline":"Atlantis European Airways","carrier_code":"TD"},{"airline":"Air Luxor GB","carrier_code":"L8"},{"airline":"Air Luxor","carrier_code":"LK"},{"airline":"Air Mauritius","carrier_code":"MK"},{"airline":"Air Madagascar","carrier_code":"MD"},{"airline":"Air Moldova","carrier_code":"9U"},{"airline":"Aero Mongolia","carrier_code":"M0"},{"airline":"Air Plus Comet","carrier_code":"A7"},{"airline":"Aeromexpress","carrier_code":"QO"},{"airline":"Air Mauritanie","carrier_code":"MR"},{"airline":"Aeroland Airways","carrier_code":"3S"},{"airline":"Astair","carrier_code":"8D"},{"airline":"Albarka Air","carrier_code":"F4"},{"airline":"Aero Contractors","carrier_code":"AJ"},{"airline":"Air Burundi","carrier_code":"8Y"},{"airline":"Aeropelican Air Services","carrier_code":"OT"},{"airline":"Air Paradise International","carrier_code":"AD"},{"airline":"Air Class Lineas Aereas","carrier_code":"QD"},{"airline":"African Safari Airways","carrier_code":"QS"},{"airline":"Airbus France","carrier_code":"4Y"},{"airline":"Air Mobility Command","carrier_code":"MC"},{"airline":"Aer Arann","carrier_code":"RE"},{"airline":"Air Austral","carrier_code":"UU"},{"airline":"Asian Spirit","carrier_code":"6K"},{"airline":"Air Afrique","carrier_code":"RK"},{"airline":"Airlinair","carrier_code":"A5"},{"airline":"Aero Lanka","carrier_code":"QL"},{"airline":"Armenian International Airways","carrier_code":"MV"},{"airline":"Air Salone","carrier_code":"20"},{"airline":"Armavia","carrier_code":"U8"},{"airline":"Aeromar","carrier_code":"BQ"},{"airline":"AeroRep","carrier_code":"P5"},{"airline":"Aero-Service","carrier_code":"BF"},{"airline":"Aerosur","carrier_code":"5L"},{"airline":"Air Santo Domingo","carrier_code":"EX"},{"airline":"Aero California","carrier_code":"JR"},{"airline":"Avient Aviation","carrier_code":"Z3"},{"airline":"Air Service","carrier_code":"M3"},{"airline":"Air Slovakia","carrier_code":"GM"},{"airline":"Aircompany Yakutia","carrier_code":"R3"},{"airline":"Aeromar","carrier_code":"VW"},{"airline":"Air Turks and Caicos","carrier_code":"JY"},{"airline":"Arkefly","carrier_code":"OR"},{"airline":"Airlines PNG","carrier_code":"CG"},{"airline":"Air Cal","carrier_code":"TY"},{"airline":"AirTran Airways","carrier_code":"FL"},{"airline":"Air Transat","carrier_code":"TS"},{"airline":"Avialeasing Aviation Company","carrier_code":"EC"},{"airline":"Tyrolean Airways","carrier_code":"VO"},{"airline":"Aero-Charter Ukraine","carrier_code":"DW"},{"airline":"Air Ukraine","carrier_code":"6U"},{"airline":"Aerolineas Galapagos (Aerogal)","carrier_code":"2K"},{"airline":"Alrosa Mirny Air Enterprise","carrier_code":"6R"},{"airline":"Baker Aviation","carrier_code":"8Q"},{"airline":"British Airways","carrier_code":"BA"},{"airline":"Biman Bangladesh Airlines","carrier_code":"BG"},{"airline":"Bluebird Cargo","carrier_code":"BF"},{"airline":"BACH Flugbetriebsges","carrier_code":"B4"},{"airline":"Blue Dart Aviation","carrier_code":"BZ"},{"airline":"B&H Airlines","carrier_code":"JA"},{"airline":"Buffalo Airways","carrier_code":"J4"},{"airline":"Benin Golf Air","carrier_code":"A8"},{"airline":"Belair Airlines","carrier_code":"4T"},{"airline":"Bahamasair","carrier_code":"UP"},{"airline":"Bringer Air Cargo Taxi Aereo","carrier_code":"E6"},{"airline":"Balkan Bulgarian Airlines","carrier_code":"LZ"},{"airline":"BA Connect","carrier_code":"TH"},{"airline":"British International Helicopters","carrier_code":"BS"},{"airline":"Bankair","carrier_code":"B4"},{"airline":"Bangkok Airways","carrier_code":"PG"},{"airline":"Blue1","carrier_code":"KF"},{"airline":"Bearskin Lake Air Service","carrier_code":"JV"},{"airline":"Bellview Airlines","carrier_code":"B3"},{"airline":"bmi","carrier_code":"BD"},{"airline":"bmibaby","carrier_code":"WW"},{"airline":"Bemidji Airlines","carrier_code":"CH"},{"airline":"Bismillah Airlines","carrier_code":"5Z"},{"airline":"Bouraq Indonesia Airlines","carrier_code":"BO"},{"airline":"Blue Panorama Airlines","carrier_code":"BV"},{"airline":"BRA-Transportes Aereos","carrier_code":"7R"},{"airline":"Bering Air","carrier_code":"8E"},{"airline":"Belavia Belarusian Airlines","carrier_code":"B2"},{"airline":"Bravo Air Congo","carrier_code":"K6"},{"airline":"Braniff International Airways","carrier_code":"BN"},{"airline":"Big Sky Airlines","carrier_code":"GQ"},{"airline":"BAL Bashkirian Airlines","carrier_code":"V9"},{"airline":"Metro Batavia","carrier_code":"7P"},{"airline":"Berjaya Air","carrier_code":"J8"},{"airline":"Blue Wings","carrier_code":"QW"},{"airline":"BAX Global","carrier_code":"8W"},{"airline":"Bayu Indonesia Air","carrier_code":"BM"},{"airline":"Brit Air","carrier_code":"DB"},{"airline":"Boston-Maine Airways","carrier_code":"E9"},{"airline":"Brussels Airlines","carrier_code":"SN"},{"airline":"Binter Canarias","carrier_code":"NT"},{"airline":"Blue Air","carrier_code":"0B"},{"airline":"British Mediterranean Airways","carrier_code":"KJ"},{"airline":"Bulgaria Air","carrier_code":"FB"},{"airline":"Barents AirLink","carrier_code":"8N"},{"airline":"CAL Cargo Air Lines","carrier_code":"5C"},{"airline":"CHC Airways","carrier_code":"AW"},{"airline":"Calima Aviacion","carrier_code":"XG"},{"airline":"Calm Air","carrier_code":"MO"},{"airline":"Camai Air","carrier_code":"R9"},{"airline":"Cameroon Airlines","carrier_code":"UY"},{"airline":"CanJet","carrier_code":"C6"},{"airline":"Canadian Airlines","carrier_code":"CP"},{"airline":"Canadian North","carrier_code":"5T"},{"airline":"Canadian Western Airlines","carrier_code":"W2"},{"airline":"Cape Air","carrier_code":"9K"},{"airline":"Capital Cargo International Airlines","carrier_code":"PT"},{"airline":"Cargo 360","carrier_code":"GG"},{"airline":"Cargoitalia","carrier_code":"2G"},{"airline":"Cargojet Airways","carrier_code":"W8"},{"airline":"Cargolux","carrier_code":"CV"},{"airline":"Caribbean Airlines","carrier_code":"BW"},{"airline":"Caribbean Star Airlines","carrier_code":"8B"},{"airline":"Carpatair","carrier_code":"V3"},{"airline":"Caspian Airlines","carrier_code":"RV"},{"airline":"Cathay Pacific","carrier_code":"CX"},{"airline":"Cayman Airways","carrier_code":"KX"},{"airline":"Cebu Pacific","carrier_code":"5J"},{"airline":"Centavia","carrier_code":"7N"},{"airline":"Centralwings","carrier_code":"C0"},{"airline":"Centre-Avia","carrier_code":"J7"},{"airline":"Centurion Air Cargo","carrier_code":"WE"},{"airline":"Chalk's Ocean Airways","carrier_code":"OP"},{"airline":"Champion Air","carrier_code":"MG"},{"airline":"Changan Airlines","carrier_code":"2Z"},{"airline":"Chari Aviation Services","carrier_code":"S8"},{"airline":"Chautauqua Airlines","carrier_code":"RP"},{"airline":"Chicago Express","carrier_code":"C8"},{"airline":"China Airlines","carrier_code":"CI"},{"airline":"China Cargo Airlines","carrier_code":"CK"},{"airline":"China Eastern Airlines","carrier_code":"MU"},{"airline":"China Northern Airlines","carrier_code":"CJ"},{"airline":"China Northwest Airlines","carrier_code":"WH"},{"airline":"China Postal Airlines","carrier_code":"8Y"},{"airline":"China Southern Airlines","carrier_code":"CZ"},{"airline":"China United Airlines","carrier_code":"HR"},{"airline":"China Xinhua Airlines","carrier_code":"XO"},{"airline":"Yunnan Airlines","carrier_code":"3Q"},{"airline":"Chitaavia","carrier_code":"X7"},{"airline":"Cielos Airlines","carrier_code":"A2"},{"airline":"Cimber Air","carrier_code":"QI"},{"airline":"Cirrus Airlines","carrier_code":"C9"},{"airline":"City Airline","carrier_code":"CF"},{"airline":"City Connexion Airlines","carrier_code":"G3"},{"airline":"CityJet","carrier_code":"WX"},{"airline":"BA CityFlyer","carrier_code":"CJ"},{"airline":"Civil Air Transport","carrier_code":"CT"},{"airline":"Club Air","carrier_code":"6P"},{"airline":"Coast Air","carrier_code":"BX"},{"airline":"Coastal Air","carrier_code":"DQ"},{"airline":"Colgan Air","carrier_code":"9L"},{"airline":"Comair","carrier_code":"OH"},{"airline":"Comair","carrier_code":"MN"},{"airline":"CommutAir","carrier_code":"C5"},{"airline":"Comores Airlines","carrier_code":"KR"},{"airline":"Compania Mexicargo","carrier_code":"GJ"},{"airline":"Compass Airlines","carrier_code":"CP"},{"airline":"Condor Flugdienst","carrier_code":"DE"},{"airline":"Consorcio Aviaxsa","carrier_code":"6A"},{"airline":"Contact Air","carrier_code":"C3"},{"airline":"Continental Airlines","carrier_code":"CO"},{"airline":"Continental Airways","carrier_code":"PC"},{"airline":"Continental Express","carrier_code":"CO"},{"airline":"Continental Micronesia","carrier_code":"CS"},{"airline":"Conviasa","carrier_code":"V0"},{"airline":"Copa Airlines","carrier_code":"CM"},{"airline":"Corsairfly","carrier_code":"SS"},{"airline":"Corse-Mediterranee","carrier_code":"XK"},{"airline":"Cosmic Air","carrier_code":"F5"},{"airline":"Croatia Airlines","carrier_code":"OU"},{"airline":"Crossair Europe","carrier_code":"QE"},{"airline":"Cubana de Aviaci\u00f3n","carrier_code":"CU"},{"airline":"Cyprus Airways","carrier_code":"CY"},{"airline":"Cyprus Turkish Airlines","carrier_code":"YK"},{"airline":"Czech Airlines","carrier_code":"OK"},{"airline":"DAS Air Cargo","carrier_code":"WD"},{"airline":"DAT Danish Air Transport","carrier_code":"DX"},{"airline":"DHL International","carrier_code":"ES"},{"airline":"DHL de Guatemala","carrier_code":"L3"},{"airline":"Daallo Airlines","carrier_code":"D3"},{"airline":"Dagestan Airlines","carrier_code":"N2"},{"airline":"Dalavia","carrier_code":"H8"},{"airline":"Darwin Airline","carrier_code":"0D"},{"airline":"Dauair","carrier_code":"D5"},{"airline":"Delta Air Lines","carrier_code":"DL"},{"airline":"Deutsche Bahn","carrier_code":"2A"},{"airline":"Deutsche Rettungsflugwacht","carrier_code":"1I"},{"airline":"Dinar","carrier_code":"D7"},{"airline":"Dirgantara Air Service","carrier_code":"AW"},{"airline":"Discovery Airways","carrier_code":"DH"},{"airline":"Djibouti Airlines","carrier_code":"D8"},{"airline":"Dominicana de Aviaci","carrier_code":"DO"},{"airline":"Domodedovo Airlines","carrier_code":"E3"},{"airline":"DonbassAero","carrier_code":"5D"},{"airline":"Dragonair","carrier_code":"KA"},{"airline":"Druk Air","carrier_code":"KB"},{"airline":"dba","carrier_code":"DI"},{"airline":"Electronic Data Systems","carrier_code":"1C"},{"airline":"EUjet","carrier_code":"VE"},{"airline":"EVA Air","carrier_code":"BR"},{"airline":"Eagle Air","carrier_code":"H7"},{"airline":"East African","carrier_code":"QU"},{"airline":"East African Safari Air","carrier_code":"S9"},{"airline":"Eastern Airways","carrier_code":"T3"},{"airline":"Eastland Air","carrier_code":"DK"},{"airline":"Eastwind Airlines","carrier_code":"W9"},{"airline":"Edelweiss Air","carrier_code":"WK"},{"airline":"Egyptair","carrier_code":"MS"},{"airline":"El Al Israel Airlines","carrier_code":"LY"},{"airline":"El-Buraq Air Transport","carrier_code":"UZ"},{"airline":"Emirates","carrier_code":"EK"},{"airline":"Empire Airlines","carrier_code":"EM"},{"airline":"Empresa Ecuatoriana De Aviacion","carrier_code":"EU"},{"airline":"Enkor JSC","carrier_code":"G8"},{"airline":"Eos Airlines","carrier_code":"E0"},{"airline":"Eritrean Airlines","carrier_code":"B8"},{"airline":"Estafeta Carga Aerea","carrier_code":"E7"},{"airline":"Estonian Air","carrier_code":"OV"},{"airline":"Ethiopian Airlines","carrier_code":"ET"},{"airline":"Etihad Airways","carrier_code":"EY"},{"airline":"Euro Exec Express","carrier_code":"RZ"},{"airline":"Eurocypria Airlines","carrier_code":"UI"},{"airline":"Eurofly Service","carrier_code":"GJ"},{"airline":"Eurolot","carrier_code":"K2"},{"airline":"Euromanx Airways","carrier_code":"3W"},{"airline":"European Air Express","carrier_code":"EA"},{"airline":"European Air Transport","carrier_code":"QY"},{"airline":"European Aviation Air Charter","carrier_code":"E7"},{"airline":"Eurowings","carrier_code":"EW"},{"airline":"Evergreen International Airlines","carrier_code":"EZ"},{"airline":"Excel Airways","carrier_code":"JN"},{"airline":"Execair Aviation","carrier_code":"MB"},{"airline":"Executive Airlines","carrier_code":"OW"},{"airline":"Expo Aviation","carrier_code":"8D"},{"airline":"Express One International","carrier_code":"EO"},{"airline":"ExpressJet","carrier_code":"XE"},{"airline":"easyJet","carrier_code":"U2"},{"airline":"Falcon Aviation","carrier_code":"IH"},{"airline":"Far Eastern Air Transport","carrier_code":"EF"},{"airline":"Faroejet","carrier_code":"F6"},{"airline":"Faso Airways","carrier_code":"F3"},{"airline":"Federal Express","carrier_code":"FX"},{"airline":"Fika Salaama Airlines","carrier_code":"N8"},{"airline":"Finalair Congo","carrier_code":"4S"},{"airline":"Finnair","carrier_code":"AY"},{"airline":"Finncomm Airlines","carrier_code":"FC"},{"airline":"Firefly","carrier_code":"FY"},{"airline":"First Air","carrier_code":"7F"},{"airline":"First Choice Airways","carrier_code":"DP"},{"airline":"Fischer Air","carrier_code":"8F"},{"airline":"Flightline","carrier_code":"B5"},{"airline":"Florida Coastal Airlines","carrier_code":"PA"},{"airline":"Florida West International Airways","carrier_code":"RF"},{"airline":"Fly Air","carrier_code":"F2"},{"airline":"Fly Me Sweden","carrier_code":"SH"},{"airline":"AirAsia X","carrier_code":"D7"},{"airline":"FlyLal","carrier_code":"TE"},{"airline":"FlyNordic","carrier_code":"LF"},{"airline":"Flybaboo","carrier_code":"F7"},{"airline":"Flybe","carrier_code":"BE"},{"airline":"Flyglobespan","carrier_code":"B4"},{"airline":"Formosa Airlines","carrier_code":"VY"},{"airline":"Forward Air International Airlines","carrier_code":"BN"},{"airline":"Four Star Aviation \/ Four Star Cargo","carrier_code":"HK"},{"airline":"Freedom Air","carrier_code":"FP"},{"airline":"Frontier Airlines","carrier_code":"F9"},{"airline":"Frontier Flying Service","carrier_code":"2F"},{"airline":"Futura International Airways","carrier_code":"FH"},{"airline":"GB Airways","carrier_code":"GT"},{"airline":"Galaxy Air","carrier_code":"7O"},{"airline":"Galileo International","carrier_code":"1G"},{"airline":"Gambia International Airlines","carrier_code":"GC"},{"airline":"Gandalf Airlines","carrier_code":"G7"},{"airline":"Garuda Indonesia","carrier_code":"GA"},{"airline":"Gazpromavia","carrier_code":"4G"},{"airline":"Gemini Air Cargo","carrier_code":"GR"},{"airline":"Georgian Airways","carrier_code":"A9"},{"airline":"Georgian National Airlines","carrier_code":"QB"},{"airline":"Germania","carrier_code":"ST"},{"airline":"Germanwings","carrier_code":"4U"},{"airline":"Gestair","carrier_code":"GP"},{"airline":"Ghana International Airlines","carrier_code":"G0"},{"airline":"Go Air","carrier_code":"G8"},{"airline":"Go One Airways","carrier_code":"GK"},{"airline":"GoJet Airlines","carrier_code":"G7"},{"airline":"Gol Transportes A\u00e9reos","carrier_code":"G3"},{"airline":"Golden Air","carrier_code":"DC"},{"airline":"Gorkha Airlines","carrier_code":"G1"},{"airline":"Grant Aviation","carrier_code":"GS"},{"airline":"Great Lakes Airlines","carrier_code":"ZK"},{"airline":"Great Wall Airlines","carrier_code":"IJ"},{"airline":"Grupo TACA","carrier_code":"TA"},{"airline":"Guine Bissaur Airlines","carrier_code":"G6"},{"airline":"Guinee Airlines","carrier_code":"J9"},{"airline":"Gujarat Airways","carrier_code":"G8"},{"airline":"Gulf Air Bahrain","carrier_code":"GF"},{"airline":"Guyana Airways 2000","carrier_code":"GY"},{"airline":"Hageland Aviation Services","carrier_code":"H6"},{"airline":"Hahn Air","carrier_code":"HR"},{"airline":"Hainan Airlines","carrier_code":"HU"},{"airline":"Hainan Phoenix Information Systems","carrier_code":"1R"},{"airline":"Haiti Ambassador Airlines","carrier_code":"2T"},{"airline":"Hamburg International","carrier_code":"4R"},{"airline":"TUIfly","carrier_code":"X3"},{"airline":"Hapagfly","carrier_code":"HF"},{"airline":"Harbor Airlines","carrier_code":"HB"},{"airline":"Harmony Airways","carrier_code":"HQ"},{"airline":"Hawaiian Airlines","carrier_code":"HA"},{"airline":"Hawaiian Pacific Airlines","carrier_code":"HP"},{"airline":"Hawkair","carrier_code":"BH"},{"airline":"Heavylift Cargo Airlines","carrier_code":"HN"},{"airline":"Heli France","carrier_code":"8H"},{"airline":"Helijet","carrier_code":"JB"},{"airline":"Helios Airways","carrier_code":"ZU"},{"airline":"Hellas Jet","carrier_code":"T4"},{"airline":"Hello","carrier_code":"HW"},{"airline":"Helvetic Airways","carrier_code":"2L"},{"airline":"Hemus Air","carrier_code":"DU"},{"airline":"Hewa Bora Airways","carrier_code":"EO"},{"airline":"Hex'Air","carrier_code":"UD"},{"airline":"Hi Fly","carrier_code":"5K"},{"airline":"Hokkaido International Airlines","carrier_code":"HD"},{"airline":"Hola Airlines","carrier_code":"H5"},{"airline":"Hong Kong Airlines","carrier_code":"HX"},{"airline":"Hong Kong Express Airways","carrier_code":"UO"},{"airline":"Hope Air","carrier_code":"HH"},{"airline":"Horizon Air","carrier_code":"QX"},{"airline":"Horizon Airlines","carrier_code":"BN"},{"airline":"H\u00e9li S\u00e9curit\u00e9 Helicopter Airlines","carrier_code":"H4"},{"airline":"IBC Airways","carrier_code":"II"},{"airline":"ICAR Airlines","carrier_code":"C3"},{"airline":"INFINI Travel Information","carrier_code":"1F"},{"airline":"ITA Software","carrier_code":"1U"},{"airline":"Iberia Airlines","carrier_code":"IB"},{"airline":"Iberworld","carrier_code":"TY"},{"airline":"Ibex Airlines","carrier_code":"FW"},{"airline":"Icelandair","carrier_code":"FI"},{"airline":"Imair Airlines","carrier_code":"IK"},{"airline":"Independence Air","carrier_code":"DH"},{"airline":"IndiGo Airlines","carrier_code":"6E"},{"airline":"Indian Airlines","carrier_code":"IC"},{"airline":"Indigo","carrier_code":"I9"},{"airline":"Indonesia AirAsia","carrier_code":"QZ"},{"airline":"Indonesian Airlines","carrier_code":"IO"},{"airline":"InteliJet Airways","carrier_code":"IJ"},{"airline":"Inter Islands Airlines","carrier_code":"H4"},{"airline":"Interair South Africa","carrier_code":"D6"},{"airline":"Interavia Airlines","carrier_code":"ZA"},{"airline":"Intercontinental de Aviaci","carrier_code":"RS"},{"airline":"Interlink Airlines","carrier_code":"ID"},{"airline":"International Business Air","carrier_code":"6I"},{"airline":"Intersky","carrier_code":"3L"},{"airline":"Interstate Airline","carrier_code":"I4"},{"airline":"Iran Air","carrier_code":"IR"},{"airline":"Iran Aseman Airlines","carrier_code":"EP"},{"airline":"Iraqi Airways","carrier_code":"IA"},{"airline":"Island Airlines","carrier_code":"IS"},{"airline":"Island Express","carrier_code":"2S"},{"airline":"Cargo Plus Aviation","carrier_code":"8L"},{"airline":"Islands Nationair","carrier_code":"CN"},{"airline":"Islas Airways","carrier_code":"IF"},{"airline":"Islena De Inversiones","carrier_code":"WC"},{"airline":"Israir","carrier_code":"6H"},{"airline":"Itali Airlines","carrier_code":"9X"},{"airline":"Itek Air","carrier_code":"GI"},{"airline":"Izair","carrier_code":"H9"},{"airline":"JAL Express","carrier_code":"JC"},{"airline":"JALways","carrier_code":"JO"},{"airline":"JSC Transport Automated Information Systems","carrier_code":"1M"},{"airline":"Japan Airlines","carrier_code":"JL"},{"airline":"Japan Airlines Domestic","carrier_code":"JL"},{"airline":"Japan Asia Airways","carrier_code":"EG"},{"airline":"Japan Transocean Air","carrier_code":"NU"},{"airline":"Jat Airways","carrier_code":"JU"},{"airline":"Jatayu Airlines","carrier_code":"VJ"},{"airline":"Jazeera Airways","carrier_code":"J9"},{"airline":"Jeju Air","carrier_code":"7C"},{"airline":"Jet Airways","carrier_code":"9W"},{"airline":"Jet Airways","carrier_code":"QJ"},{"airline":"Jetclub","carrier_code":"0J"},{"airline":"Jetstar Asia Airways","carrier_code":"3K"},{"airline":"Jet2.com","carrier_code":"LS"},{"airline":"Jet4You","carrier_code":"8J"},{"airline":"JetBlue Airways","carrier_code":"B6"},{"airline":"Jetairfly","carrier_code":"JF"},{"airline":"Jetclub","carrier_code":"0J"},{"airline":"JetsGo","carrier_code":"SG"},{"airline":"Jetstar Airways","carrier_code":"JQ"},{"airline":"Jett8 Airlines Cargo","carrier_code":"JX"},{"airline":"Jetx Airlines","carrier_code":"GX"},{"airline":"Jordan Aviation","carrier_code":"R5"},{"airline":"Juneyao Airlines","carrier_code":"HO"},{"airline":"KD Avia","carrier_code":"KD"},{"airline":"KLM Cityhopper","carrier_code":"WA"},{"airline":"KLM Royal Dutch Airlines","carrier_code":"KL"},{"airline":"Kabo Air","carrier_code":"N2"},{"airline":"Kalitta Air","carrier_code":"K4"},{"airline":"Kam Air","carrier_code":"RQ"},{"airline":"Kampuchea Airlines","carrier_code":"E2"},{"airline":"Karat","carrier_code":"V2"},{"airline":"Kavminvodyavia","carrier_code":"KV"},{"airline":"Kenmore Air","carrier_code":"M5"},{"airline":"Kenya Airways","carrier_code":"KQ"},{"airline":"Keystone Air Services","carrier_code":"BZ"},{"airline":"Kingfisher Airlines","carrier_code":"IT"},{"airline":"Kish Air","carrier_code":"Y9"},{"airline":"Kiwi International Air Lines","carrier_code":"KP"},{"airline":"Kogalymavia Air Company","carrier_code":"7K"},{"airline":"Komiinteravia","carrier_code":"8J"},{"airline":"Korean Air","carrier_code":"KE"},{"airline":"Krasnojarsky Airlines","carrier_code":"7B"},{"airline":"Krylo Airlines","carrier_code":"K9"},{"airline":"Kuban Airlines","carrier_code":"GW"},{"airline":"Kunpeng Airlines","carrier_code":"VD"},{"airline":"Kuwait Airways","carrier_code":"KU"},{"airline":"Kuzu Airlines Cargo","carrier_code":"GO"},{"airline":"Kyrgyz Airlines","carrier_code":"N5"},{"airline":"Kyrgyzstan","carrier_code":"QH"},{"airline":"Kyrgyzstan Airlines","carrier_code":"R8"},{"airline":"Kibris T","carrier_code":"KY"},{"airline":"L.A.B. Flying Service","carrier_code":"JF"},{"airline":"LACSA","carrier_code":"LR"},{"airline":"LAI - Linea Aerea IAACA","carrier_code":"KG"},{"airline":"LAN Airlines","carrier_code":"LA"},{"airline":"LAN Argentina","carrier_code":"4M"},{"airline":"LAN Express","carrier_code":"LU"},{"airline":"LAN Peru","carrier_code":"LP"},{"airline":"LOT Polish Airlines","carrier_code":"LO"},{"airline":"LTE International Airways","carrier_code":"XO"},{"airline":"LTU Austria","carrier_code":"L3"},{"airline":"LTU International","carrier_code":"LT"},{"airline":"Lagun Air","carrier_code":"N6"},{"airline":"Lankair","carrier_code":"IK"},{"airline":"Lao Airlines","carrier_code":"QV"},{"airline":"Laoag International Airlines","carrier_code":"L7"},{"airline":"Lauda Air","carrier_code":"NG"},{"airline":"Lebanese Air Transport","carrier_code":"LQ"},{"airline":"Leeward Islands Air Transport","carrier_code":"LI"},{"airline":"Libyan Arab Airlines","carrier_code":"LN"},{"airline":"Linea Aerea SAPSA","carrier_code":"L7"},{"airline":"Linea Aerea de Servicio Ejecutivo Regional","carrier_code":"8z"},{"airline":"Linea Turistica Aerotuy","carrier_code":"LD"},{"airline":"Lineas Aereas Azteca","carrier_code":"ZE"},{"airline":"Linhas A","carrier_code":"LM"},{"airline":"Lion Mentari Airlines","carrier_code":"JT"},{"airline":"Livingston","carrier_code":"LM"},{"airline":"Lloyd Aereo Boliviano","carrier_code":"LB"},{"airline":"Luftfahrtgesellschaft Walter","carrier_code":"HE"},{"airline":"Lufthansa","carrier_code":"LH"},{"airline":"Lufthansa Cargo","carrier_code":"LH"},{"airline":"Lufthansa CityLine","carrier_code":"CL"},{"airline":"Lufthansa Systems","carrier_code":"L1"},{"airline":"Lufttaxi Fluggesellschaft","carrier_code":"DV"},{"airline":"Lufttransport","carrier_code":"L5"},{"airline":"Luxair","carrier_code":"LG"},{"airline":"Lviv Airlines","carrier_code":"5V"},{"airline":"Lynden Air Cargo","carrier_code":"L2"},{"airline":"L","carrier_code":"MJ"},{"airline":"MasAir","carrier_code":"M7"},{"airline":"MAT Macedonian Airlines","carrier_code":"IN"},{"airline":"MIAT Mongolian Airlines","carrier_code":"OM"},{"airline":"MNG Airlines","carrier_code":"MB"},{"airline":"Macair Airlines","carrier_code":"CC"},{"airline":"Maersk","carrier_code":"DM"},{"airline":"Mahan Air","carrier_code":"W5"},{"airline":"Mahfooz Aviation","carrier_code":"M2"},{"airline":"Malaysia Airlines","carrier_code":"MH"},{"airline":"Malm\u00f6 Aviation","carrier_code":"TF"},{"airline":"Malta Air Charter","carrier_code":"R5"},{"airline":"Mal\u00e9v","carrier_code":"MA"},{"airline":"Mandala Airlines","carrier_code":"RI"},{"airline":"Mandarin Airlines","carrier_code":"AE"},{"airline":"Mango","carrier_code":"JE"},{"airline":"Mars RK","carrier_code":"6V"},{"airline":"Marsland Aviation","carrier_code":"M7"},{"airline":"Martinair","carrier_code":"MP"},{"airline":"Mastertop Linhas Aereas","carrier_code":"Q4"},{"airline":"Mavial Magadan Airlines","carrier_code":"H5"},{"airline":"Maxair","carrier_code":"8M"},{"airline":"Maxjet Airways","carrier_code":"MY"},{"airline":"Maya Island Air","carrier_code":"MW"},{"airline":"Menajet","carrier_code":"IM"},{"airline":"Meridiana","carrier_code":"IG"},{"airline":"Merpati Nusantara Airlines","carrier_code":"MZ"},{"airline":"Mesa Airlines","carrier_code":"YV"},{"airline":"Mesaba Airlines","carrier_code":"XJ"},{"airline":"Mexicana de Aviaci","carrier_code":"MX"},{"airline":"Miami Air International","carrier_code":"GL"},{"airline":"Middle East Airlines","carrier_code":"ME"},{"airline":"Midway Airlines","carrier_code":"JI"},{"airline":"Midwest Airlines","carrier_code":"YX"},{"airline":"Midwest Airlines (Egypt)","carrier_code":"MY"},{"airline":"Moldavian Airlines","carrier_code":"2M"},{"airline":"Monarch Airlines","carrier_code":"ZB"},{"airline":"Myway Airlines","carrier_code":"8I"},{"airline":"Montenegro Airlines","carrier_code":"YM"},{"airline":"Moskovia Airlines","carrier_code":"3R"},{"airline":"Motor Sich","carrier_code":"M9"},{"airline":"Mount Cook Airlines","carrier_code":"NM"},{"airline":"Mountain Air Company","carrier_code":"N4"},{"airline":"MyTravel Airways","carrier_code":"VZ"},{"airline":"Myanma Airways","carrier_code":"UB"},{"airline":"Myanmar Airways International","carrier_code":"8M"},{"airline":"Nantucket Airlines","carrier_code":"DV"},{"airline":"Nas Air","carrier_code":"P9"},{"airline":"Nasair","carrier_code":"UE"},{"airline":"National Airlines","carrier_code":"N4"},{"airline":"National Airlines","carrier_code":"N7"},{"airline":"National Airlines","carrier_code":"NA"},{"airline":"National Airways Cameroon","carrier_code":"9O"},{"airline":"National Jet Systems","carrier_code":"NC"},{"airline":"Nationwide Airlines","carrier_code":"CE"},{"airline":"Nauru Air Corporation","carrier_code":"ON"},{"airline":"Navitaire","carrier_code":"1N"},{"airline":"Nepal Airlines","carrier_code":"RA"},{"airline":"Neos","carrier_code":"NO"},{"airline":"NetJets","carrier_code":"1I"},{"airline":"New England Airlines","carrier_code":"EJ"},{"airline":"NextJet","carrier_code":"2N"},{"airline":"Niki","carrier_code":"HG"},{"airline":"Nippon Cargo Airlines","carrier_code":"KZ"},{"airline":"Nok Air","carrier_code":"DD"},{"airline":"Nordeste Linhas Aereas Regionais","carrier_code":"JH"},{"airline":"Nordic Regional","carrier_code":"6N"},{"airline":"North Coast Aviation","carrier_code":"N9"},{"airline":"North Flying","carrier_code":"M3"},{"airline":"North-Wright Airways","carrier_code":"HW"},{"airline":"Northern Air Cargo","carrier_code":"NC"},{"airline":"Northern Dene Airways","carrier_code":"U7"},{"airline":"Northwest Airlines","carrier_code":"NW"},{"airline":"Northwest Regional Airlines","carrier_code":"FY"},{"airline":"Northwestern Air","carrier_code":"J3"},{"airline":"Norwegian Air Shuttle","carrier_code":"DY"},{"airline":"Nouvel Air Tunisie","carrier_code":"BJ"},{"airline":"Nova Airline","carrier_code":"M4"},{"airline":"Novair","carrier_code":"1I"},{"airline":"Nuevo Continente","carrier_code":"N6"},{"airline":"Nas Air","carrier_code":"XY"},{"airline":"O'Connor Airlines","carrier_code":"UQ"},{"airline":"OAG","carrier_code":"CR"},{"airline":"Oasis Hong Kong Airlines","carrier_code":"O8"},{"airline":"Ocean Airlines","carrier_code":"VC"},{"airline":"Oceanair","carrier_code":"O6"},{"airline":"Oceanic Airlines","carrier_code":"O2"},{"airline":"Olympic Airlines","carrier_code":"OA"},{"airline":"Oman Air","carrier_code":"WY"},{"airline":"Omni Air International","carrier_code":"OY"},{"airline":"Omskavia Airline","carrier_code":"N3"},{"airline":"Onur Air","carrier_code":"8Q"},{"airline":"Orenburg Airlines","carrier_code":"R2"},{"airline":"Orient Thai Airlines","carrier_code":"OX"},{"airline":"Origin Pacific Airways","carrier_code":"QO"},{"airline":"Ostfriesische Lufttransport","carrier_code":"OL"},{"airline":"Our Airline","carrier_code":"ON"},{"airline":"Overland Airways","carrier_code":"OJ"},{"airline":"Ozark Air Lines","carrier_code":"OZ"},{"airline":"Ozjet Airlines","carrier_code":"O7"},{"airline":"PAN Air","carrier_code":"PV"},{"airline":"PB Air","carrier_code":"9Q"},{"airline":"PLUNA","carrier_code":"PU"},{"airline":"PMTair","carrier_code":"U4"},{"airline":"Pace Airlines","carrier_code":"Y5"},{"airline":"Jetstar Pacific","carrier_code":"BL"},{"airline":"Pacific Blue","carrier_code":"DJ"},{"airline":"Pacific Coastal Airline","carrier_code":"8P"},{"airline":"Pacific East Asia Cargo Airlines","carrier_code":"Q8"},{"airline":"Pacific Southwest Airlines","carrier_code":"PS"},{"airline":"Pacific Wings","carrier_code":"LW"},{"airline":"Pacificair","carrier_code":"GX"},{"airline":"Pakistan International Airlines","carrier_code":"PK"},{"airline":"Palau Trans Pacific Airline","carrier_code":"GP"},{"airline":"Palestinian Airlines","carrier_code":"PF"},{"airline":"Pamir Airways","carrier_code":"NR"},{"airline":"Pan American Airways","carrier_code":"PA"},{"airline":"Pan American World Airways","carrier_code":"PA"},{"airline":"Panafrican Airways","carrier_code":"PQ"},{"airline":"Pantanal Linhas A\u00e9reas","carrier_code":"P8"},{"airline":"Paramount Airways","carrier_code":"I7"},{"airline":"Pearl Airways","carrier_code":"HP"},{"airline":"Pegasus Airlines","carrier_code":"PC"},{"airline":"Pegasus Hava Tasimaciligi","carrier_code":"1I"},{"airline":"Peninsula Airways","carrier_code":"KS"},{"airline":"Perm Airlines","carrier_code":"P9"},{"airline":"Philippine Airlines","carrier_code":"PR"},{"airline":"Phoenix Airways","carrier_code":"HP"},{"airline":"Phuket Air","carrier_code":"9R"},{"airline":"Piedmont Airlines (1948-1989)","carrier_code":"PI"},{"airline":"Pinnacle Airlines","carrier_code":"9E"},{"airline":"Polar Air Cargo","carrier_code":"PO"},{"airline":"Polynesian Airlines","carrier_code":"PH"},{"airline":"Polynesian Blue","carrier_code":"DJ"},{"airline":"Polyot Sirena","carrier_code":"1U"},{"airline":"Porter Airlines","carrier_code":"PD"},{"airline":"Portugalia","carrier_code":"NI"},{"airline":"Potomac Air","carrier_code":"BK"},{"airline":"Precision Air","carrier_code":"PW"},{"airline":"President Airlines","carrier_code":"TO"},{"airline":"Primaris Airlines","carrier_code":"FE"},{"airline":"Princess Air","carrier_code":"8Q"},{"airline":"Private Wings Flugcharter","carrier_code":"8W"},{"airline":"Proflight Commuter Services","carrier_code":"P0"},{"airline":"Qantas","carrier_code":"QF"},{"airline":"Qatar Airways","carrier_code":"QR"},{"airline":"RACSA","carrier_code":"R6"},{"airline":"Radixx Solutions International","carrier_code":"1D"},{"airline":"Redhill Aviation","carrier_code":"8L"},{"airline":"Reem Air","carrier_code":"V4"},{"airline":"Regional Airlines","carrier_code":"FN"},{"airline":"Regional Express","carrier_code":"ZL"},{"airline":"RegionsAir","carrier_code":"3C"},{"airline":"Reno Air","carrier_code":"QQ"},{"airline":"Republic Airlines","carrier_code":"RW"},{"airline":"Republic Express Airlines","carrier_code":"RH"},{"airline":"Rico Linhas A","carrier_code":"C7"},{"airline":"Rio Grande Air","carrier_code":"E2"},{"airline":"Rio Sul Servi","carrier_code":"SL"},{"airline":"Rossiya","carrier_code":"R4"},{"airline":"Air Rarotonga","carrier_code":"GZ"},{"airline":"Royal Air Force","carrier_code":"RR"},{"airline":"Royal Air Force of Oman","carrier_code":"RS"},{"airline":"Royal Air Maroc","carrier_code":"AT"},{"airline":"Royal Airlines","carrier_code":"R0"},{"airline":"Royal Aruban Airline","carrier_code":"V5"},{"airline":"Royal Brunei Airlines","carrier_code":"BI"},{"airline":"Royal Jordanian","carrier_code":"RJ"},{"airline":"Royal Khmer Airlines","carrier_code":"RK"},{"airline":"Royal Nepal Airlines","carrier_code":"RA"},{"airline":"Royal Tongan Airlines","carrier_code":"WR"},{"airline":"Russian Sky Airlines","carrier_code":"P7"},{"airline":"Rwandair Express","carrier_code":"WB"},{"airline":"Ryan International Airlines","carrier_code":"RD"},{"airline":"Ryanair","carrier_code":"FR"},{"airline":"R\u00e9gional","carrier_code":"YS"},{"airline":"SATA International","carrier_code":"S4"},{"airline":"South African Airways","carrier_code":"SA"},{"airline":"Shaheen Air International","carrier_code":"NL"},{"airline":"Scandinavian Airlines System","carrier_code":"SK"},{"airline":"S7 Airlines","carrier_code":"S7"},{"airline":"Seaborne Airlines","carrier_code":"BB"},{"airline":"SriLankan Airlines","carrier_code":"UL"},{"airline":"Sun Country Airlines","carrier_code":"SY"},{"airline":"Sky Express","carrier_code":"G3"},{"airline":"Spicejet","carrier_code":"SG"},{"airline":"Sky Eyes","carrier_code":"I6"},{"airline":"SAETA","carrier_code":"EH"},{"airline":"Star Flyer","carrier_code":"7G"},{"airline":"Safair","carrier_code":"FA"},{"airline":"Skagway Air Service","carrier_code":"N5"},{"airline":"SATA Air Acores","carrier_code":"SP"},{"airline":"Scorpio Aviation","carrier_code":"8S"},{"airline":"Singapore Airlines","carrier_code":"SQ"},{"airline":"Sibaviatrans","carrier_code":"5M"},{"airline":"Skynet Airlines","carrier_code":"SI"},{"airline":"SITA","carrier_code":"XS"},{"airline":"Sriwijaya Air","carrier_code":"SJ"},{"airline":"Sama Airlines","carrier_code":"ZS"},{"airline":"Singapore Airlines Cargo","carrier_code":"SQ"},{"airline":"Siem Reap Airways","carrier_code":"FT"},{"airline":"Sky Work Airlines","carrier_code":"SX"},{"airline":"Swedline Express","carrier_code":"SM"},{"airline":"South East Asian Airlines","carrier_code":"DG"},{"airline":"SwedJet Airways","carrier_code":"VD"},{"airline":"Skyservice Airlines","carrier_code":"5G"},{"airline":"Servicios de Transportes A","carrier_code":"FS"},{"airline":"Sudan Airways","carrier_code":"SD"},{"airline":"Sun Air (Fiji)","carrier_code":"PI"},{"airline":"Sun Air of Scandinavia","carrier_code":"EZ"},{"airline":"Saudi Arabian Airlines","carrier_code":"SV"},{"airline":"Southwest Airlines","carrier_code":"WN"},{"airline":"Southern Winds Airlines","carrier_code":"A4"},{"airline":"Sunwing Airlines","carrier_code":"WG"},{"airline":"Swiss International Air Lines","carrier_code":"LX"},{"airline":"Swissair","carrier_code":"SR"},{"airline":"Swe Fly","carrier_code":"WV"},{"airline":"Shovkoviy Shlyah","carrier_code":"S8"},{"airline":"SunExpress","carrier_code":"XQ"},{"airline":"Syrian Arab Airlines","carrier_code":"RB"},{"airline":"Skywalk Airlines","carrier_code":"AL"},{"airline":"Silk Way Airlines","carrier_code":"ZP"},{"airline":"Samara Airlines","carrier_code":"E5"},{"airline":"Shandong Airlines","carrier_code":"SC"},{"airline":"Spring Airlines","carrier_code":"9S"},{"airline":"Sichuan Airlines","carrier_code":"3U"},{"airline":"Shanghai Airlines","carrier_code":"FM"},{"airline":"Shenzhen Airlines","carrier_code":"ZH"},{"airline":"Shanxi Airlines","carrier_code":"8C"},{"airline":"Sun D'Or","carrier_code":"7L"},{"airline":"SkyEurope","carrier_code":"NE"},{"airline":"Sunshine Express Airlines","carrier_code":"CQ"},{"airline":"Superior Aviation","carrier_code":"SO"},{"airline":"Spanair","carrier_code":"JK"},{"airline":"San Juan Airlines","carrier_code":"2G"},{"airline":"Sabre Pacific","carrier_code":"1Z"},{"airline":"Sabre","carrier_code":"1S"},{"airline":"Sierra Nevada Airlines","carrier_code":"1I"},{"airline":"Siren-Travel","carrier_code":"1H"},{"airline":"Sirena","carrier_code":"1Q"},{"airline":"Sky Trek International Airlines","carrier_code":"1I"},{"airline":"Southern Cross Distribution","carrier_code":"1K"},{"airline":"Sutra","carrier_code":"1K"},{"airline":"SNCF","carrier_code":"2C"},{"airline":"Star Equatorial Airlines","carrier_code":"2S"},{"airline":"Spirit Airlines","carrier_code":"NK"},{"airline":"SATENA","carrier_code":"9R"},{"airline":"Slok Air Gambia","carrier_code":"S0"},{"airline":"Sosoliso Airlines","carrier_code":"SO"},{"airline":"Sky Trek International Airlines","carrier_code":"1I"},{"airline":"Skybus Airlines","carrier_code":"SX"},{"airline":"SkyKing Turks and Caicos Airways","carrier_code":"RU"},{"airline":"Santa Barbara Airlines","carrier_code":"S3"},{"airline":"Sky Airline","carrier_code":"H2"},{"airline":"SkyWest","carrier_code":"OO"},{"airline":"Skyways Express","carrier_code":"JZ"},{"airline":"Skymark Airlines","carrier_code":"BC"},{"airline":"Sierra National Airlines","carrier_code":"LJ"},{"airline":"SilkAir","carrier_code":"MI"},{"airline":"Slovak Airlines","carrier_code":"6Q"},{"airline":"Surinam Airways","carrier_code":"PY"},{"airline":"Servant Air","carrier_code":"8D"},{"airline":"Sterling Airlines","carrier_code":"NB"},{"airline":"Skynet Asia Airways","carrier_code":"6J"},{"airline":"Solomon Airlines","carrier_code":"IE"},{"airline":"Saratov Aviation Division","carrier_code":"6W"},{"airline":"Sat Airlines","carrier_code":"HZ"},{"airline":"Shuttle America","carrier_code":"S5"},{"airline":"Scat Air","carrier_code":"DV"},{"airline":"Sirin","carrier_code":"R1"},{"airline":"Star Air","carrier_code":"S6"},{"airline":"TAME","carrier_code":"EQ"},{"airline":"TAM Brazilian Airlines","carrier_code":"JJ"},{"airline":"TAP Portugal","carrier_code":"TP"},{"airline":"Tunisair","carrier_code":"TU"},{"airline":"TNT Airways","carrier_code":"3V"},{"airline":"Tropical Airways","carrier_code":"M7"},{"airline":"Thai Air Cargo","carrier_code":"T2"},{"airline":"Thomas Cook Airlines","carrier_code":"FQ"},{"airline":"Thomas Cook Airlines","carrier_code":"MT"},{"airline":"Tandem Aero","carrier_code":"TQ"},{"airline":"Teamline Air","carrier_code":"L9"},{"airline":"Transeuropean Airlines","carrier_code":"UE"},{"airline":"Titan Airways","carrier_code":"ZT"},{"airline":"Tiger Airways","carrier_code":"TR"},{"airline":"Tiger Airways Australia","carrier_code":"TT"},{"airline":"Thai Airways International","carrier_code":"TG"},{"airline":"Thai AirAsia","carrier_code":"FD"},{"airline":"Turkish Airlines","carrier_code":"TK"},{"airline":"Twin Jet","carrier_code":"T7"},{"airline":"Thai Sky Airlines","carrier_code":"9I"},{"airline":"Tulip Air","carrier_code":"TD"},{"airline":"Trans Mediterranean Airlines","carrier_code":"TL"},{"airline":"Tri-MG Intra Asia Airlines","carrier_code":"GY"},{"airline":"Tiara Air","carrier_code":"3P"},{"airline":"Tobruk Air","carrier_code":"7T"},{"airline":"Tol-Air Services","carrier_code":"TI"},{"airline":"Thomsonfly","carrier_code":"BY"},{"airline":"Tropic Air","carrier_code":"PM"},{"airline":"Tower Air","carrier_code":"FF"},{"airline":"TAMPA","carrier_code":"QT"},{"airline":"TransAsia Airways","carrier_code":"GE"},{"airline":"Transavia Holland","carrier_code":"HV"},{"airline":"TACV","carrier_code":"VR"},{"airline":"TransMeridian Airlines","carrier_code":"T9"},{"airline":"Transmile Air Services","carrier_code":"TH"},{"airline":"Trast Aero","carrier_code":"S5"},{"airline":"Transwest Air","carrier_code":"9T"},{"airline":"Transaero Airlines","carrier_code":"UN"},{"airline":"Thai Star Airlines","carrier_code":"T9"},{"airline":"Turkmenistan Airlines","carrier_code":"T5"},{"airline":"Tuninter","carrier_code":"UG"},{"airline":"Tavrey Airlines","carrier_code":"T6"},{"airline":"Travel Service","carrier_code":"QS"},{"airline":"Trans World Airlines","carrier_code":"TW"},{"airline":"Transaviaexport","carrier_code":"AL"},{"airline":"TUIfly Nordic","carrier_code":"6B"},{"airline":"TAAG Angola Airlines","carrier_code":"DT"},{"airline":"Tassili Airlines","carrier_code":"SF"},{"airline":"TAM Mercosur","carrier_code":"PZ"},{"airline":"Trans States Airlines","carrier_code":"AX"},{"airline":"Travelsky Technology","carrier_code":"1E"},{"airline":"Thalys","carrier_code":"2H"},{"airline":"Open Skies Consultative Commission","carrier_code":"1L"},{"airline":"Tarom","carrier_code":"RO"},{"airline":"Turan Air","carrier_code":"3T"},{"airline":"TRIP Linhas A","carrier_code":"8R"},{"airline":"Transports et Travaux A","carrier_code":"OF"},{"airline":"USA3000 Airlines","carrier_code":"U5"},{"airline":"United Airlines","carrier_code":"UA"},{"airline":"United Feeder Service","carrier_code":"U2"},{"airline":"USA Jet Airlines","carrier_code":"U7"},{"airline":"Ural Airlines","carrier_code":"U6"},{"airline":"UM Airlines","carrier_code":"UF"},{"airline":"Ukrainian Cargo Airways","carrier_code":"6Z"},{"airline":"United Parcel Service","carrier_code":"5X"},{"airline":"US Airways","carrier_code":"US"},{"airline":"UTair Aviation","carrier_code":"UT"},{"airline":"Uzbekistan Airways","carrier_code":"HY"},{"airline":"Ukraine International Airlines","carrier_code":"PS"},{"airline":"US Helicopter Corporation","carrier_code":"UH"},{"airline":"V Australia Airlines","carrier_code":"VA"},{"airline":"Valuair","carrier_code":"VF"},{"airline":"Voyageur Airways","carrier_code":"VC"},{"airline":"Vietnam Airlines","carrier_code":"VN"},{"airline":"VIM Airlines","carrier_code":"NN"},{"airline":"VIA Rail Canada","carrier_code":"2R"},{"airline":"Viasa","carrier_code":"VA"},{"airline":"Volaris","carrier_code":"Y4"},{"airline":"Volga-Dnepr Airlines","carrier_code":"VI"},{"airline":"Virgin America","carrier_code":"VX"},{"airline":"Virgin Express","carrier_code":"TV"},{"airline":"Virgin Nigeria Airways","carrier_code":"VK"},{"airline":"Virgin Atlantic Airways","carrier_code":"VS"},{"airline":"Viva Macau","carrier_code":"ZG"},{"airline":"Volare Airlines","carrier_code":"VE"},{"airline":"Vueling Airlines","carrier_code":"VY"},{"airline":"Vladivostok Air","carrier_code":"XF"},{"airline":"Varig Log","carrier_code":"LC"},{"airline":"Viaggio Air","carrier_code":"VM"},{"airline":"Virgin Australia","carrier_code":"VA"},{"airline":"Virgin Blue","carrier_code":"DJ"},{"airline":"VRG Linhas Aereas","carrier_code":"RG"},{"airline":"VASP","carrier_code":"VP"},{"airline":"VLM Airlines","carrier_code":"VG"},{"airline":"Wayraper","carrier_code":"7W"},{"airline":"WebJet Linhas A","carrier_code":"WJ"},{"airline":"Welcome Air","carrier_code":"2W"},{"airline":"West Air Sweden","carrier_code":"PT"},{"airline":"West Coast Air","carrier_code":"8O"},{"airline":"WestJet","carrier_code":"WS"},{"airline":"Western Airlines","carrier_code":"WA"},{"airline":"Westward Airways","carrier_code":"CN"},{"airline":"Wider\u00f8e","carrier_code":"WF"},{"airline":"Wind Jet","carrier_code":"IV"},{"airline":"Wings Air","carrier_code":"IW"},{"airline":"Wings of Alaska","carrier_code":"K5"},{"airline":"Wizz Air","carrier_code":"W6"},{"airline":"Wizz Air Hungary","carrier_code":"8Z"},{"airline":"World Airways","carrier_code":"WO"},{"airline":"Worldspan","carrier_code":"1P"},{"airline":"Wright Air Service","carrier_code":"8V"},{"airline":"XL Airways France","carrier_code":"SE"},{"airline":"Xiamen Airlines","carrier_code":"MF"},{"airline":"Xtra Airways","carrier_code":"XP"},{"airline":"Yamal Airlines","carrier_code":"YL"},{"airline":"Yangtze River Express","carrier_code":"Y8"},{"airline":"Yemenia","carrier_code":"IY"},{"airline":"Zambian Airways","carrier_code":"Q3"},{"airline":"Zip","carrier_code":"3J"},{"airline":"Zimex Aviation","carrier_code":"C4"},{"airline":"Zoom Airlines","carrier_code":"Z4"},{"airline":"Tyrolean Airways","carrier_code":"\\N"},{"airline":"buzz","carrier_code":"UK"},{"airline":"Maldivian Air Taxi","carrier_code":"8Q"},{"airline":"Sky Express","carrier_code":"XW"},{"airline":"Yellow Air Taxi","carrier_code":"Y0"},{"airline":"Royal Air Cambodge","carrier_code":"VJ"},{"airline":"Air Mandalay","carrier_code":"6T"},{"airline":"TAN-SAHSA","carrier_code":"SH"},{"airline":"Air Busan","carrier_code":"BX"},{"airline":"TUI Airlines Belgium","carrier_code":"TB"},{"airline":"Braathens","carrier_code":"BU"},{"airline":"Globus","carrier_code":"GH"},{"airline":"Air Kazakhstan","carrier_code":"9Y"},{"airline":"Japan Air System","carrier_code":"JD"},{"airline":"Annsett New Zealand (NZA)","carrier_code":"ZQ"},{"airline":"EasyJet (DS)","carrier_code":"DS"},{"airline":"Star Peru (2I)","carrier_code":"2I"},{"airline":"Carnival Air Lines","carrier_code":"KW"},{"airline":"United Airways","carrier_code":"4H"},{"airline":"Trans Maldivian Airways","carrier_code":"M8"},{"airline":"Fly540","carrier_code":"5H"},{"airline":"Transavia France","carrier_code":"TO"},{"airline":"Island Air (WP)","carrier_code":"WP"},{"airline":"1-2-go","carrier_code":"OG"},{"airline":"Uni Air","carrier_code":"B7"},{"airline":"Gomelavia","carrier_code":"YD"},{"airline":"Red Wings","carrier_code":"WZ"},{"airline":"TUIfly (X3)","carrier_code":"11"},{"airline":"Felix Airways","carrier_code":"FU"},{"airline":"Kostromskie avialinii","carrier_code":"K1"},{"airline":"Greenfly","carrier_code":"XX"},{"airline":"Tajik Air","carrier_code":"7J"},{"airline":"Air Mozambique","carrier_code":"TM"},{"airline":"ELK Airways","carrier_code":"--"},{"airline":"Gabon Airlines","carrier_code":"GY"},{"airline":"Maldivo Airlines","carrier_code":"ML"},{"airline":"Virgin Pacific","carrier_code":"VH"},{"airline":"Zest Air","carrier_code":"Z2"},{"airline":"Yangon Airways","carrier_code":"HK"},{"airline":"Transport A\u00e9rien Transr\u00e9gional","carrier_code":"IJ"},{"airline":"Minerva Airlines","carrier_code":"N4"},{"airline":"Eastar Jet","carrier_code":"ZE"},{"airline":"Jin Air","carrier_code":"LJ"},{"airline":"A\u00e9ris (Priv)","carrier_code":"SH"},{"airline":"Air Arabia Maroc","carrier_code":"3O"},{"airline":"Baltic Air lines","carrier_code":"B1"},{"airline":"Ciel Canadien","carrier_code":"YC"},{"airline":"Canadian National Airways","carrier_code":"CN"},{"airline":"Epic Holiday","carrier_code":"FA"},{"airline":"Air Comet Chile","carrier_code":"3I"},{"airline":"Nazca","carrier_code":"-."},{"airline":"Voronezhskie Airlanes","carrier_code":"DN"},{"airline":"Line Blue","carrier_code":"L8"},{"airline":"Blue Sky America","carrier_code":"BU"},{"airline":"Texas Spirit","carrier_code":"XS"},{"airline":"Illinois Airways","carrier_code":"IL"},{"airline":"Salzburg arrows","carrier_code":"SZ"},{"airline":"Texas Wings","carrier_code":"TQ"},{"airline":"California Western","carrier_code":"KT"},{"airline":"Dennis Sky","carrier_code":"DH"},{"airline":"Zz","carrier_code":"ZZ"},{"airline":"Atifly","carrier_code":"A1"},{"airline":"Air UK","carrier_code":"UK"},{"airline":"Suckling Airways","carrier_code":"CB"},{"airline":"Reno Sky","carrier_code":"RY"},{"airline":"Ciao Air","carrier_code":"99"},{"airline":"Birmingham European","carrier_code":"VB"},{"airline":"Pal airlines","carrier_code":"5P"},{"airline":"CanXpress","carrier_code":"C1"},{"airline":"Danube Wings (V5)","carrier_code":"V5"},{"airline":"Sharp Airlines","carrier_code":"SH"},{"airline":"CanXplorer","carrier_code":"C2"},{"airline":"Click (Mexicana)","carrier_code":"QA"},{"airline":"World Experience Airline","carrier_code":"W1"},{"airline":"ALAK","carrier_code":"J4"},{"airline":"AJT Air International","carrier_code":"E9"},{"airline":"Air Choice One","carrier_code":"3E"},{"airline":"China United","carrier_code":"KN"},{"airline":"Locair","carrier_code":"ZQ"},{"airline":"Safi Airlines","carrier_code":"4Q"},{"airline":"SeaPort Airlines","carrier_code":"K5"},{"airline":"Salmon Air","carrier_code":"S6"},{"airline":"Fly Illi","carrier_code":"IL"},{"airline":"Bobb Air Freight","carrier_code":"01"},{"airline":"Star1 Airlines","carrier_code":"V9"},{"airline":"Pelita","carrier_code":"6D"},{"airline":"Alpi Eagles (E8)","carrier_code":"E8"},{"airline":"Alaska Seaplane Service","carrier_code":"J5"},{"airline":"TAN","carrier_code":"T8"},{"airline":"MexicanaLink","carrier_code":"I6"},{"airline":"Island Spirit","carrier_code":"IP"},{"airline":"TACA Peru","carrier_code":"T0"},{"airline":"Pan Am World Airways Dominicana","carrier_code":"7Q"},{"airline":"Primera Air","carrier_code":"PF"},{"airline":"Air Antilles Express","carrier_code":"3S"},{"airline":"Regional Paraguaya","carrier_code":"P7"},{"airline":"VIP Ecuador","carrier_code":"V6"},{"airline":"Peruvian Airlines","carrier_code":"P9"},{"airline":"Polar Airlines","carrier_code":"\u042f\u041f"},{"airline":"Catovair","carrier_code":"OC"},{"airline":"Halcyonair","carrier_code":"7Z"},{"airline":"Business Aviation","carrier_code":"4P"},{"airline":"Compagnie Africaine d\\\\'Aviation","carrier_code":"E9"},{"airline":"Zambia Skyways","carrier_code":"K8"},{"airline":"AlMasria Universal Airlines","carrier_code":"UJ"},{"airline":"SmartLynx Airlines","carrier_code":"6Y"},{"airline":"KoralBlue Airlines","carrier_code":"K7"},{"airline":"Elysian Airlines","carrier_code":"E4"},{"airline":"Hellenic Imperial Airways","carrier_code":"HT"},{"airline":"Amsterdam Airlines","carrier_code":"WD"},{"airline":"Arik Niger","carrier_code":"Q9"},{"airline":"Dana Air","carrier_code":"DA"},{"airline":"STP Airways","carrier_code":"8F"},{"airline":"Med Airways","carrier_code":"7Y"},{"airline":"Skyjet Airlines","carrier_code":"UQ"},{"airline":"Air Volga","carrier_code":"G6"},{"airline":"Royal Falcon","carrier_code":"RL"},{"airline":"Euroline","carrier_code":"4L"},{"airline":"Worldways","carrier_code":"WG"},{"airline":"Athens Airways","carrier_code":"ZF"},{"airline":"Viking Hellas","carrier_code":"VQ"},{"airline":"Starline.kz","carrier_code":"DZ"},{"airline":"Euro Harmony","carrier_code":"EH"},{"airline":"Lugansk Airlines","carrier_code":"L7"},{"airline":"Gryphon Airlines","carrier_code":"6P"},{"airline":"Gadair European Airlines","carrier_code":"GP"},{"airline":"Spirit of Manila Airlines","carrier_code":"SM"},{"airline":"Chongqing Airlines","carrier_code":"OQ"},{"airline":"West Air China","carrier_code":"PN"},{"airline":"Falcon Air (IH)","carrier_code":"IH"},{"airline":"QatXpress","carrier_code":"C3"},{"airline":"OneChina","carrier_code":"1C"},{"airline":"NordStar Airlines","carrier_code":"Y7"},{"airline":"Joy Air","carrier_code":"JR"},{"airline":"Air India Regional","carrier_code":"CD"},{"airline":"MDLR Airlines","carrier_code":"9H"},{"airline":"Maldivian","carrier_code":"Q2"},{"airline":"Xpressair","carrier_code":"XN"},{"airline":"Strategic Airlines","carrier_code":"VC"},{"airline":"Al-Naser Airlines","carrier_code":"NA"},{"airline":"Fuji Dream Airlines","carrier_code":"JH"},{"airline":"SGA Airlines","carrier_code":"5E"},{"airline":"Air2there","carrier_code":"F8"},{"airline":"Avianova (Russia)","carrier_code":"AO"},{"airline":"Parmiss Airlines (IPV)","carrier_code":"PA"},{"airline":"EuropeSky","carrier_code":"ES"},{"airline":"BRAZIL AIR","carrier_code":"GB"},{"airline":"Homer Air","carrier_code":"MR"},{"airline":"Court Line","carrier_code":"??"},{"airline":"South West Africa Territory Force","carrier_code":"??"},{"airline":"Lombards Air","carrier_code":"++"},{"airline":"U.S. Air","carrier_code":"-+"},{"airline":"Flitestar","carrier_code":"GM"},{"airline":"Jayrow","carrier_code":"\\\\'"},{"airline":"Llloyd Helicopters","carrier_code":"::"},{"airline":"Wilderness Air","carrier_code":";;"},{"airline":"Whitaker Air","carrier_code":"^^"},{"airline":"PanAm World Airways","carrier_code":"WQ"},{"airline":"Virginwings","carrier_code":"YY"},{"airline":"KSY","carrier_code":"KY"},{"airline":"Buquebus L\u00edneas A\u00e9reas","carrier_code":"BQ"},{"airline":"SOCHI AIR","carrier_code":"CQ"},{"airline":"Wizz Air Ukraine","carrier_code":"WU"},{"airline":"88","carrier_code":"47"},{"airline":"LCM AIRLINES","carrier_code":"LQ"},{"airline":"Aero Brazil","carrier_code":"BZ"},{"airline":"Cambodia Angkor Air (K6)","carrier_code":"K6"},{"airline":"Skyline nepc","carrier_code":"D5"},{"airline":"THREE","carrier_code":"H3"},{"airline":"Royal European Airlines","carrier_code":"69"},{"airline":"Tom\\\\'s & co airliners","carrier_code":"&T"},{"airline":"Azul","carrier_code":"AD"},{"airline":"LSM Airlines","carrier_code":"PQ"},{"airline":"LionXpress","carrier_code":"C4"},{"airline":"Nik Airways","carrier_code":"X1"},{"airline":"Genesis","carrier_code":"GK"},{"airline":"Congo Express","carrier_code":"XZ"},{"airline":"Fly Dubai","carrier_code":"FZ"},{"airline":"Domenican Airlines","carrier_code":"D1"},{"airline":"Air Atlantic","carrier_code":"9A"},{"airline":"Air Ops","carrier_code":"CR"},{"airline":"Aereonautica militare","carrier_code":"JY"},{"airline":"LSM AIRLINES ","carrier_code":"YZ"},{"airline":"Aero Lloyd (YP)","carrier_code":"YP"},{"airline":"UTair-Express","carrier_code":"UR"},{"airline":"Huaxia","carrier_code":"G5"},{"airline":"Zabaykalskii Airlines","carrier_code":"ZP"},{"airline":"Marysya Airlines","carrier_code":"M4"},{"airline":"N1","carrier_code":"N1"},{"airline":"Airlink (SAA)","carrier_code":"4Z"},{"airline":"JobAir","carrier_code":"3B"},{"airline":"Zuliana de Aviacion","carrier_code":"OD"},{"airline":"Black Stallion Airways","carrier_code":"BZ"},{"airline":"German International Air Lines","carrier_code":"GM"},{"airline":"TrasBrasil","carrier_code":"TB"},{"airline":"TransBrasil Airlines","carrier_code":"TH"},{"airline":"China SSS","carrier_code":"9C"},{"airline":"Nihon.jet","carrier_code":"NJ"},{"airline":"Transportes A\u00e9reos Nacionales de Selva","carrier_code":"TJ"},{"airline":"Air Mekong","carrier_code":"P8"},{"airline":"Harbour Air (Priv)","carrier_code":"H3"},{"airline":"Air Hamburg (AHO)","carrier_code":"HH"},{"airline":"ZABAIKAL AIRLINES","carrier_code":"Z6"},{"airline":"TransHolding","carrier_code":"TI"},{"airline":"Yeti Airways","carrier_code":"YT"},{"airline":"Yellowstone Club Private Shuttle","carrier_code":"Y1"},{"airline":"Caucasus Airlines","carrier_code":"NS"},{"airline":"Serbian Airlines","carrier_code":"S1"},{"airline":"Windward Islands Airways","carrier_code":"WM"},{"airline":"TransHolding System","carrier_code":"YO"},{"airline":"CCML Airlines","carrier_code":"CB"},{"airline":"Air Charter International","carrier_code":"SF"},{"airline":"Fly Brasil","carrier_code":"F1"},{"airline":"CB Airways UK ( Interliging Flights )","carrier_code":"1F"},{"airline":"Fly Colombia ( Interliging Flights )","carrier_code":"3F"},{"airline":"Trans Pas Air","carrier_code":"T6"},{"airline":"KMV","carrier_code":"\u041c\u0418"},{"airline":"Himalayan Airlines","carrier_code":"HC"},{"airline":"Indya Airline Group","carrier_code":"G1"},{"airline":"Sunwing","carrier_code":"WG"},{"airline":"Japan Regio","carrier_code":"ZX"},{"airline":"Norte Lineas Aereas","carrier_code":"N0"},{"airline":"Austral Brasil","carrier_code":"W7"},{"airline":"PEGASUS AIRLINES-","carrier_code":"H9"},{"airline":"AirLibert\u00e9","carrier_code":"IJ"},{"airline":"Camair-co","carrier_code":"QC"},{"airline":"Aerocontinente (Priv)","carrier_code":"N6"},{"airline":"Sky Regional","carrier_code":"RS"},{"airline":"TUR Avrupa Hava Yollar\u00c4\u00b1","carrier_code":"YI"},{"airline":"LSM International ","carrier_code":"II"},{"airline":"Baikotovitchestrian Airlines ","carrier_code":"BU"},{"airline":"Luchsh Airlines ","carrier_code":"L4"},{"airline":"Zimbabwean Airlines","carrier_code":"Z7"},{"airline":"Air Cargo Germany","carrier_code":"6U"},{"airline":"Mongolian International Air Lines ","carrier_code":"7M"},{"airline":"Alaniya Airlines","carrier_code":"2D"},{"airline":"Tway Airlines","carrier_code":"TW"},{"airline":"Papillon Grand Canyon Helicopters","carrier_code":"HI"},{"airline":"Jusur airways","carrier_code":"JX"},{"airline":"NEXT Brasil","carrier_code":"XB"},{"airline":"AeroWorld ","carrier_code":"W4"},{"airline":"Cook Island Air","carrier_code":"KH"},{"airline":"US Africa Airways","carrier_code":"E8"},{"airline":"GNB Linhas Aereas","carrier_code":"GN"},{"airline":"Usa Sky Cargo","carrier_code":"E1"},{"airline":"Hankook Airline","carrier_code":"HN"},{"airline":"Red Jet America","carrier_code":"RR"},{"airline":"REDjet","carrier_code":"Z7"},{"airline":"Hellenic Airways","carrier_code":"1H"},{"airline":"Red Jet Andes","carrier_code":"PT"},{"airline":"Red Jet Canada","carrier_code":"QY"},{"airline":"Red Jet Mexico","carrier_code":"4X"},{"airline":"Marusya Airways","carrier_code":"Y8"},{"airline":"Era Alaska","carrier_code":"7H"},{"airline":"AirRussia","carrier_code":"R8"},{"airline":"Hankook Air US","carrier_code":"H1"},{"airline":"NEPC Airlines","carrier_code":"D5"},{"airline":"Canadian World","carrier_code":"10"},{"airline":"I-Fly","carrier_code":"H5"},{"airline":"T.A.T","carrier_code":"IJ"},{"airline":"Alinord","carrier_code":"DN"},{"airline":"Pacific Express","carrier_code":"VB"},{"airline":"VickJet","carrier_code":"KT"},{"airline":"BVI Airways","carrier_code":"XV"},{"airline":"Salsa d\\\\'Haiti","carrier_code":"SO"},{"airline":"Zambezi Airlines (ZMA)","carrier_code":"ZJ"},{"airline":"Polet Airlines (Priv)","carrier_code":"YQ"},{"airline":"TROPICAL LINHAS AEREAS","carrier_code":"T1"},{"airline":"12 North","carrier_code":"12"},{"airline":"Mauritania Airlines International","carrier_code":"L6"},{"airline":"MAT Airways","carrier_code":"6F"},{"airline":"Asian Wings Airways","carrier_code":"AW"},{"airline":"Air Arabia Egypt","carrier_code":"E5"},{"airline":"Alitalia Cityliner","carrier_code":"CT"},{"airline":"Orchid Airlines","carrier_code":"OI"},{"airline":"Asia Wings","carrier_code":"Y5"},{"airline":"Skywest Australia","carrier_code":"XR"},{"airline":"Nile Air","carrier_code":"NP"},{"airline":"Senegal Airlines","carrier_code":"DN"},{"airline":"Fly 6ix","carrier_code":"6I"},{"airline":"Starbow Airlines","carrier_code":"S9"},{"airline":"Copenhagen Express","carrier_code":"0X"},{"airline":"BusinessAir","carrier_code":"8B"},{"airline":"SENIC AIRLINES","carrier_code":"YR"},{"airline":"Sky Wing Pacific","carrier_code":"C7"},{"airline":"Air Indus","carrier_code":"PP"},{"airline":"Samurai Airlines","carrier_code":"07"},{"airline":"AirOne Continental","carrier_code":"00"},{"airline":"AirOne Polska","carrier_code":"U1"},{"airline":"Peach Aviation","carrier_code":"MM"},{"airline":"Aviabus","carrier_code":"U1"},{"airline":"Michael Airlines","carrier_code":"DF"},{"airline":"Korongo Airlines","carrier_code":"ZC"},{"airline":"Indonesia Sky","carrier_code":"I5"},{"airline":"Pelangi ","carrier_code":"9P"},{"airline":"Aws express","carrier_code":"B0"},{"airline":"Southjet","carrier_code":"76"},{"airline":"Southjet connect","carrier_code":"77"},{"airline":"Air Cape","carrier_code":"KP"},{"airline":"Southjet cargo","carrier_code":"78"},{"airline":"Iberia Express","carrier_code":"I2"},{"airline":"Interjet (ABC Aerolineas)","carrier_code":"4O"},{"airline":"AirOnix","carrier_code":"OG"},{"airline":"Nordic Global Airlines","carrier_code":"NJ"},{"airline":"Scoot","carrier_code":"TZ"},{"airline":"Starling Airlines Spain","carrier_code":"SX"},{"airline":"Hi Fly (5K)","carrier_code":"5K"},{"airline":"China Northwest Airlines (WH)","carrier_code":"WH"},{"airline":"Zenith International Airline","carrier_code":"ZN"},{"airline":"Orbit Airlines Azerbaijan","carrier_code":"O1"},{"airline":"Air Alps Aviation (A6)","carrier_code":"A6"},{"airline":"Patriot Airways","carrier_code":"P4"},{"airline":"Vision Airlines (V2)","carrier_code":"V2"},{"airline":"Chicago Express (C8)","carrier_code":"C8"},{"airline":"BQB Lineas Aereas","carrier_code":"5Q"},{"airline":"Yellowtail","carrier_code":"YE"},{"airline":"Royal Airways","carrier_code":"KG"},{"airline":"FlyHigh Airlines Ireland (FH)","carrier_code":"FH"},{"airline":"Aero VIP (2D)","carrier_code":"2D"},{"airline":"Yangon Airways Ltd.","carrier_code":"YH"},{"airline":"T.J. Air","carrier_code":"TJ"},{"airline":"SkyWork Airlines ","carrier_code":"SX"},{"airline":"ValueJet","carrier_code":"J7"},{"airline":"Maastricht Airlines","carrier_code":"W2"},{"airline":"CheapFlyingInternational","carrier_code":"WL"},{"airline":"Aviaexpresscruise","carrier_code":"E6"},{"airline":"Euro Jet","carrier_code":"24"},{"airline":"AirOne Atlantic","carrier_code":"00"},{"airline":"HQ- Business Express","carrier_code":"HQ"},{"airline":"Royal Southern Airlines.","carrier_code":"R1"},{"airline":"SOCHI AIR CHATER","carrier_code":"Q3"},{"airline":"Denim Air ","carrier_code":"J7"},{"airline":"WestAir","carrier_code":"OE"},{"airline":"WestAir Airlines","carrier_code":"OE"},{"airline":"WestAir Airlines ","carrier_code":"OE"},{"airline":"North Pacific Airlines","carrier_code":"NO"},{"airline":"Malindo Air","carrier_code":"OD"},{"airline":"Tramm Airlines","carrier_code":"9F"},{"airline":"Lina Congo","carrier_code":"GC"},{"airline":"Flightlink Tanzania","carrier_code":"Z9"},{"airline":"IzAvia","carrier_code":"I8"},{"airline":"3 Valleys Airlines","carrier_code":"3V"},{"airline":"Maryland Air","carrier_code":"M1"},{"airline":"Insel Air (7I\/INC) (Priv)","carrier_code":"7I"},{"airline":"VivaColombia","carrier_code":"5Z"},{"airline":"Apache Air","carrier_code":"ZM"},{"airline":"MHS Aviation GmbH","carrier_code":"M2"},{"airline":"Jettor Airlines","carrier_code":"NR"},{"airline":"GoDutch","carrier_code":"GD"},{"airline":"Thai Lion Air","carrier_code":"SL"},{"airline":"Deutsche Luftverkehrsgesellschaft","carrier_code":"DW"},{"airline":"National Air Cargo","carrier_code":"N8"},{"airline":"Eastern Atlantic Virtual Airlines","carrier_code":"13"},{"airline":"Citilink Indonesia","carrier_code":"QG"},{"airline":"Gulisano airways","carrier_code":"GU"},{"airline":"Caribbean Wings","carrier_code":"XP"},{"airline":"Snowbird Airlines","carrier_code":"S8"},{"airline":"Kharkiv Airlines","carrier_code":"KH"},{"airline":"XAIR USA","carrier_code":"XA"},{"airline":"Air Costa","carrier_code":"LB"},{"airline":"Global Freightways","carrier_code":"F5"},{"airline":"XPTO","carrier_code":"XP"},{"airline":"Malawian Airlines","carrier_code":"3W"},{"airline":"Avilu","carrier_code":".."},{"airline":"Air Serbia","carrier_code":"JU"},{"airline":"Air Lituanica","carrier_code":"LT"},{"airline":"Rainbow Air (RAI)","carrier_code":"RN"},{"airline":"Rainbow Air Canada","carrier_code":"RY"},{"airline":"Rainbow Air Polynesia","carrier_code":"RX"},{"airline":"Rainbow Air Euro","carrier_code":"RU"},{"airline":"Rainbow Air US","carrier_code":"RM"},{"airline":"Dobrolet","carrier_code":"QD"},{"airline":"Spike Airlines","carrier_code":"S0"},{"airline":"All Argentina","carrier_code":"L1"},{"airline":"All America","carrier_code":"A2"},{"airline":"All Asia","carrier_code":"L9"},{"airline":"All Africa","carrier_code":"9A"},{"airline":"Regionalia M\u00e9xico","carrier_code":"N4"},{"airline":"All Europe","carrier_code":"N9"},{"airline":"All Spain","carrier_code":"N7"},{"airline":"Regional Air Iceland","carrier_code":"9N"},{"airline":"British Air Ferries","carrier_code":"??"},{"airline":"Voestar","carrier_code":"8K"},{"airline":"All Colombia","carrier_code":"7O"},{"airline":"Regionalia Uruguay","carrier_code":"2X"},{"airline":"Regionalia Venezuela","carrier_code":"9X"},{"airline":"Regionalia Chile","carrier_code":"9J"},{"airline":"Vuela Cuba","carrier_code":"6C"},{"airline":"All Australia","carrier_code":"88"},{"airline":"Fly Europa","carrier_code":"ER"},{"airline":"FlyPortugal","carrier_code":"PO"},{"airline":"Spring Airlines Japan","carrier_code":"IJ"},{"airline":"Dense Airways","carrier_code":"KP"},{"airline":"Dense Connection","carrier_code":"KZ"},{"airline":"Vuola Italia","carrier_code":"4S"},{"airline":"Island Express Air","carrier_code":"1X"},{"airline":"All Argentina Express","carrier_code":"Z0"},{"airline":"Thai Smile Airways","carrier_code":"WE"},{"airline":"International AirLink","carrier_code":"I4"},{"airline":"Real Tonga","carrier_code":"RT"},{"airline":"All America AR","carrier_code":"2R"},{"airline":"All America CL","carrier_code":"1R"},{"airline":"SOCHI AIR EXPRESS","carrier_code":"Q4"},{"airline":"All America BR","carrier_code":"1Y"},{"airline":"FRA Air","carrier_code":"X9"},{"airline":"Royal","carrier_code":"QN"},{"airline":"GREAT LAKES (GX)","carrier_code":"GX"},{"airline":"Volotea Costa Rica","carrier_code":"9V"},{"airline":"Fly Romania","carrier_code":"X5"},{"airline":"Eagle Atlantic Airlines","carrier_code":"E2"},{"airline":"All America CO","carrier_code":"0Y"},{"airline":"All America MX","carrier_code":"0M"},{"airline":"FOX Linhas Aereas","carrier_code":"FX"},{"airline":"Wings of England","carrier_code":"EX"},{"airline":"Air Kenya (Priv)","carrier_code":"QP"},{"airline":"Via Conectia Airlines","carrier_code":"6V"},{"airline":"City Airways","carrier_code":"E8"},{"airline":"Norwegian Long Haul AS","carrier_code":"DU"},{"airline":"TransNusa Air","carrier_code":"M8"},{"airline":"Tomp Airlines","carrier_code":"ZT"},{"airline":"OneJet","carrier_code":"J1"},{"airline":"Global Airlines","carrier_code":"0G"},{"airline":"International Flying Service","carrier_code":"F4"},{"airline":"Air Vistara","carrier_code":"UK"},{"airline":"TransRussiaAirlines","carrier_code":"1E"},{"airline":"Severstal Air Company","carrier_code":"D2"},{"airline":"REXAIR VIRTUEL","carrier_code":"RR"},{"airline":"WestJet Encore","carrier_code":"WR"},{"airline":"Air Pegasus","carrier_code":"OP"},{"airline":"International Europe","carrier_code":"9I"},{"airline":"V Air","carrier_code":"ZV"},{"airline":"Naka Nihon Airlines Service","carrier_code":"NV"},{"airline":"Islands Express","carrier_code":"X9"},{"airline":"Atlantic Air Services","carrier_code":"X7"},{"airline":"Boutique Air (Priv)","carrier_code":"4B"},{"airline":"VOLOTEA Airways","carrier_code":"V7"},{"airline":"Aguilar Connect","carrier_code":"3X"},{"airline":"ROYAL BRITAIN","carrier_code":"7V"},{"airline":"INAVIA Internacional","carrier_code":"Z5"},{"airline":"Liberty Airways","carrier_code":"LE"},{"airline":"\u0410\u044d\u0440\u043e\u0441\u0435\u0440\u0432\u0438\u0441","carrier_code":"\u0410\u042f"},{"airline":"Bassaka airlines","carrier_code":"5B"},{"airline":"SkyBahamas Airlines","carrier_code":"Q7"},{"airline":"UVT Aero","carrier_code":"UW"},{"airline":"Silver Airways (3M)","carrier_code":"3M"},{"airline":"ATA Airlines (Iran)","carrier_code":"I3"},{"airline":"VIA L\u00edneas A\u00e9reas","carrier_code":"V1"},{"airline":"Palair Macedonia","carrier_code":"3D"},{"airline":"Palair Macedonia (3D)","carrier_code":"3D"},{"airline":"GermanXL","carrier_code":"GX"},{"airline":"Fly France","carrier_code":"FF"},{"airline":"Europe Jet","carrier_code":"EX"},{"airline":"Deutsche Luftverkehrsgesellschaft (DLT)","carrier_code":"DW"},{"airline":"Atlantic Air Cargo","carrier_code":"K3"},{"airline":"World Scale Airlines","carrier_code":"W3"},{"airline":"All America US","carrier_code":"AG"},{"airline":"BudgetAir","carrier_code":"1K"},{"airline":"Fly One","carrier_code":"F5"},{"airline":"Nordica","carrier_code":"EE"},{"airline":"Dummy","carrier_code":"0E"},{"airline":"All America BOPY","carrier_code":"0P"},{"airline":"Air Andaman (2Y)","carrier_code":"2Y"},{"airline":"Jetgo Australia","carrier_code":"JG"},{"airline":"Air Carnival","carrier_code":"2S"},{"airline":"Svyaz Rossiya","carrier_code":"7R"}];

    airportDescriptions = [
      {
        "airport_id": 1,
        "language_id": 1,
        "description": "Amsterdam Schiphol"
      },
      {
        "airport_id": 1,
        "language_id": 2,
        "description": "Amsterdam Schiphol"
      },
      {
        "airport_id": 2,
        "language_id": 1,
        "description": "Cape Town"
      },
      {
        "airport_id": 2,
        "language_id": 2,
        "description": "Kaapstad"
      },
      {
        "airport_id": 3,
        "language_id": 1,
        "description": "Brussels"
      },
      {
        "airport_id": 3,
        "language_id": 2,
        "description": "Brussel"
      },
      {
        "airport_id": 4,
        "language_id": 1,
        "description": "Buenos Aires Ezeiza Airport"
      },
      {
        "airport_id": 4,
        "language_id": 2,
        "description": "Buenos Aires Ezeiza Airport"
      },
      {
        "airport_id": 5,
        "language_id": 1,
        "description": "Abu Dhabi"
      },
      {
        "airport_id": 5,
        "language_id": 2,
        "description": "Abu Dhabi"
      },
      {
        "airport_id": 6,
        "language_id": 1,
        "description": "Antigua International Airport"
      },
      {
        "airport_id": 6,
        "language_id": 2,
        "description": "Vliegveld Antigua Internationaal"
      },
      {
        "airport_id": 7,
        "language_id": 1,
        "description": "Barbuda Codrington Airport"
      },
      {
        "airport_id": 7,
        "language_id": 2,
        "description": "Vliegveld Barbuda Codrington"
      },
      {
        "airport_id": 8,
        "language_id": 1,
        "description": "Bariloche"
      },
      {
        "airport_id": 8,
        "language_id": 2,
        "description": "Bariloche"
      },
      {
        "airport_id": 9,
        "language_id": 1,
        "description": "Buenos Aires Aeroparque Jorge Newbery Airport"
      },
      {
        "airport_id": 9,
        "language_id": 2,
        "description": "Buenos Aires Aeroparque Jorge Newbery Airport"
      },
      {
        "airport_id": 10,
        "language_id": 1,
        "description": "Calafate"
      },
      {
        "airport_id": 10,
        "language_id": 2,
        "description": "Calafate"
      },
      {
        "airport_id": 11,
        "language_id": 1,
        "description": "Cordoba"
      },
      {
        "airport_id": 11,
        "language_id": 2,
        "description": "Cordoba"
      },
      {
        "airport_id": 12,
        "language_id": 1,
        "description": "Corrientes"
      },
      {
        "airport_id": 12,
        "language_id": 2,
        "description": "Corrientes"
      },
      {
        "airport_id": 13,
        "language_id": 1,
        "description": "Formosa"
      },
      {
        "airport_id": 13,
        "language_id": 2,
        "description": "Formosa"
      },
      {
        "airport_id": 14,
        "language_id": 1,
        "description": "La Rioja"
      },
      {
        "airport_id": 14,
        "language_id": 2,
        "description": "La Rioja"
      },
      {
        "airport_id": 15,
        "language_id": 1,
        "description": "Mar del Plata"
      },
      {
        "airport_id": 15,
        "language_id": 2,
        "description": "Mar del Plata"
      },
      {
        "airport_id": 16,
        "language_id": 1,
        "description": "Mendoza"
      },
      {
        "airport_id": 16,
        "language_id": 2,
        "description": "Mendoza"
      },
      {
        "airport_id": 17,
        "language_id": 1,
        "description": "Posadas"
      },
      {
        "airport_id": 17,
        "language_id": 2,
        "description": "Posadas"
      },
      {
        "airport_id": 18,
        "language_id": 1,
        "description": "Puerto Iguazú"
      },
      {
        "airport_id": 18,
        "language_id": 2,
        "description": "Puerto Iguazú"
      },
      {
        "airport_id": 19,
        "language_id": 1,
        "description": "Rio Gallegos"
      },
      {
        "airport_id": 19,
        "language_id": 2,
        "description": "Rio Gallegos"
      },
      {
        "airport_id": 20,
        "language_id": 1,
        "description": "Salta"
      },
      {
        "airport_id": 20,
        "language_id": 2,
        "description": "Salta"
      },
      {
        "airport_id": 21,
        "language_id": 1,
        "description": "San Juan"
      },
      {
        "airport_id": 21,
        "language_id": 2,
        "description": "San Juan"
      },
      {
        "airport_id": 22,
        "language_id": 1,
        "description": "Trelew"
      },
      {
        "airport_id": 22,
        "language_id": 2,
        "description": "Trelew"
      },
      {
        "airport_id": 23,
        "language_id": 1,
        "description": "Tucuman"
      },
      {
        "airport_id": 23,
        "language_id": 2,
        "description": "Tucuman"
      },
      {
        "airport_id": 24,
        "language_id": 1,
        "description": "Ushuaia"
      },
      {
        "airport_id": 24,
        "language_id": 2,
        "description": "Ushuaia"
      },
      {
        "airport_id": 25,
        "language_id": 1,
        "description": "Adelaide Airport"
      },
      {
        "airport_id": 25,
        "language_id": 2,
        "description": "Adelaide Airport"
      },
      {
        "airport_id": 26,
        "language_id": 1,
        "description": "Alice Springs Airport"
      },
      {
        "airport_id": 26,
        "language_id": 2,
        "description": "Alice Springs Airport"
      },
      {
        "airport_id": 27,
        "language_id": 1,
        "description": "Ayers Rock Airport"
      },
      {
        "airport_id": 27,
        "language_id": 2,
        "description": "Ayers Rock Airport"
      },
      {
        "airport_id": 28,
        "language_id": 1,
        "description": "Cairns Airport"
      },
      {
        "airport_id": 28,
        "language_id": 2,
        "description": "Cairns Airport"
      },
      {
        "airport_id": 29,
        "language_id": 1,
        "description": "Darwin Airport"
      },
      {
        "airport_id": 29,
        "language_id": 2,
        "description": "Darwin Airport"
      },
      {
        "airport_id": 30,
        "language_id": 1,
        "description": "Melbourne Airport"
      },
      {
        "airport_id": 30,
        "language_id": 2,
        "description": "Melbourne Airport"
      },
      {
        "airport_id": 31,
        "language_id": 1,
        "description": "Perth Airport"
      },
      {
        "airport_id": 31,
        "language_id": 2,
        "description": "Perth Airport"
      },
      {
        "airport_id": 32,
        "language_id": 1,
        "description": "Sydney Airport"
      },
      {
        "airport_id": 32,
        "language_id": 2,
        "description": "Sydney Airport"
      },
      {
        "airport_id": 33,
        "language_id": 1,
        "description": "Nassau"
      },
      {
        "airport_id": 33,
        "language_id": 2,
        "description": "Nassau"
      },
      {
        "airport_id": 34,
        "language_id": 1,
        "description": "Bahrain"
      },
      {
        "airport_id": 34,
        "language_id": 2,
        "description": "Bahrain"
      },
      {
        "airport_id": 35,
        "language_id": 1,
        "description": "Bridgetown"
      },
      {
        "airport_id": 35,
        "language_id": 2,
        "description": "Bridgetown"
      },
      {
        "airport_id": 36,
        "language_id": 1,
        "description": "Brussels Midi"
      },
      {
        "airport_id": 36,
        "language_id": 2,
        "description": "Brussel Midi"
      },
      {
        "airport_id": 37,
        "language_id": 1,
        "description": "Antwerpen Central"
      },
      {
        "airport_id": 37,
        "language_id": 2,
        "description": "Antwerpen Centraal"
      },
      {
        "airport_id": 38,
        "language_id": 1,
        "description": "Belize-City"
      },
      {
        "airport_id": 38,
        "language_id": 2,
        "description": "Belize-Stad"
      },
      {
        "airport_id": 39,
        "language_id": 1,
        "description": "San Pedro Ambergris"
      },
      {
        "airport_id": 39,
        "language_id": 2,
        "description": "San Pedro Ambergris"
      },
      {
        "airport_id": 40,
        "language_id": 1,
        "description": "Paro Airport"
      },
      {
        "airport_id": 40,
        "language_id": 2,
        "description": "Vliegveld Paro"
      },
      {
        "airport_id": 41,
        "language_id": 1,
        "description": "La Paz"
      },
      {
        "airport_id": 41,
        "language_id": 2,
        "description": "La Paz"
      },
      {
        "airport_id": 42,
        "language_id": 1,
        "description": "Gaberone Airport"
      },
      {
        "airport_id": 42,
        "language_id": 2,
        "description": "Vliegveld Gaberone"
      },
      {
        "airport_id": 43,
        "language_id": 1,
        "description": "Kasane Airport"
      },
      {
        "airport_id": 43,
        "language_id": 2,
        "description": "Kasane Airport"
      },
      {
        "airport_id": 44,
        "language_id": 1,
        "description": "Maun Airport"
      },
      {
        "airport_id": 44,
        "language_id": 2,
        "description": "Maun Airport"
      },
      {
        "airport_id": 45,
        "language_id": 1,
        "description": "Airpass"
      },
      {
        "airport_id": 45,
        "language_id": 2,
        "description": "Airpass"
      },
      {
        "airport_id": 46,
        "language_id": 1,
        "description": "Alta Floresta"
      },
      {
        "airport_id": 46,
        "language_id": 2,
        "description": "Alta Floresta"
      },
      {
        "airport_id": 47,
        "language_id": 1,
        "description": "Belo Horizonte"
      },
      {
        "airport_id": 47,
        "language_id": 2,
        "description": "Belo Horizonte"
      },
      {
        "airport_id": 48,
        "language_id": 1,
        "description": "Brasilia"
      },
      {
        "airport_id": 48,
        "language_id": 2,
        "description": "Brasilia"
      },
      {
        "airport_id": 49,
        "language_id": 1,
        "description": "Campo Grande"
      },
      {
        "airport_id": 49,
        "language_id": 2,
        "description": "Campo Grande"
      },
      {
        "airport_id": 50,
        "language_id": 1,
        "description": "Cuiabá"
      },
      {
        "airport_id": 50,
        "language_id": 2,
        "description": "Cuiabá"
      },
      {
        "airport_id": 51,
        "language_id": 1,
        "description": "Fernando de Noronha"
      },
      {
        "airport_id": 51,
        "language_id": 2,
        "description": "Fernando de Noronha"
      },
      {
        "airport_id": 52,
        "language_id": 1,
        "description": "Florianopolis"
      },
      {
        "airport_id": 52,
        "language_id": 2,
        "description": "Florianopolis"
      },
      {
        "airport_id": 53,
        "language_id": 1,
        "description": "Foz do Iguazú"
      },
      {
        "airport_id": 53,
        "language_id": 2,
        "description": "Foz do Iguazú"
      },
      {
        "airport_id": 54,
        "language_id": 1,
        "description": "Illheus"
      },
      {
        "airport_id": 54,
        "language_id": 2,
        "description": "Illheus"
      },
      {
        "airport_id": 55,
        "language_id": 1,
        "description": "Manaus"
      },
      {
        "airport_id": 55,
        "language_id": 2,
        "description": "Manaus"
      },
      {
        "airport_id": 56,
        "language_id": 1,
        "description": "Natal"
      },
      {
        "airport_id": 56,
        "language_id": 2,
        "description": "Natal"
      },
      {
        "airport_id": 57,
        "language_id": 1,
        "description": "Porto Seguro"
      },
      {
        "airport_id": 57,
        "language_id": 2,
        "description": "Porto Seguro"
      },
      {
        "airport_id": 58,
        "language_id": 1,
        "description": "Recife"
      },
      {
        "airport_id": 58,
        "language_id": 2,
        "description": "Recife"
      },
      {
        "airport_id": 59,
        "language_id": 1,
        "description": "Rio de Janeiro"
      },
      {
        "airport_id": 59,
        "language_id": 2,
        "description": "Rio de Janeiro"
      },
      {
        "airport_id": 60,
        "language_id": 1,
        "description": "Salvador"
      },
      {
        "airport_id": 60,
        "language_id": 2,
        "description": "Salvador"
      },
      {
        "airport_id": 61,
        "language_id": 1,
        "description": "Sao Luiz"
      },
      {
        "airport_id": 61,
        "language_id": 2,
        "description": "Sao Luiz"
      },
      {
        "airport_id": 62,
        "language_id": 1,
        "description": "Sao Paulo International Airport"
      },
      {
        "airport_id": 62,
        "language_id": 2,
        "description": "Sao Paulo International Airport"
      },
      {
        "airport_id": 63,
        "language_id": 1,
        "description": "Sao Paolo National"
      },
      {
        "airport_id": 63,
        "language_id": 2,
        "description": "Sao Paolo Nationaal"
      },
      {
        "airport_id": 64,
        "language_id": 1,
        "description": "Tefe"
      },
      {
        "airport_id": 64,
        "language_id": 2,
        "description": "Tefe"
      },
      {
        "airport_id": 65,
        "language_id": 1,
        "description": "Phnom Penh"
      },
      {
        "airport_id": 65,
        "language_id": 2,
        "description": "Phnom Penh"
      },
      {
        "airport_id": 66,
        "language_id": 1,
        "description": "Siem Reap Airport"
      },
      {
        "airport_id": 66,
        "language_id": 2,
        "description": "Vliegveld Siem Reap"
      },
      {
        "airport_id": 67,
        "language_id": 1,
        "description": "St. Johns"
      },
      {
        "airport_id": 67,
        "language_id": 2,
        "description": "St. Johns"
      },
      {
        "airport_id": 68,
        "language_id": 1,
        "description": "Toronto"
      },
      {
        "airport_id": 68,
        "language_id": 2,
        "description": "Toronto"
      },
      {
        "airport_id": 69,
        "language_id": 1,
        "description": "Winnipeg"
      },
      {
        "airport_id": 69,
        "language_id": 2,
        "description": "Winnipeg"
      },
      {
        "airport_id": 70,
        "language_id": 1,
        "description": "Canouan"
      },
      {
        "airport_id": 70,
        "language_id": 2,
        "description": "Canouan"
      },
      {
        "airport_id": 71,
        "language_id": 1,
        "description": "Bangui"
      },
      {
        "airport_id": 71,
        "language_id": 2,
        "description": "Bangui"
      },
      {
        "airport_id": 72,
        "language_id": 1,
        "description": "Antofagasta"
      },
      {
        "airport_id": 72,
        "language_id": 2,
        "description": "Antofagasta"
      },
      {
        "airport_id": 73,
        "language_id": 1,
        "description": "Arica"
      },
      {
        "airport_id": 73,
        "language_id": 2,
        "description": "Arica"
      },
      {
        "airport_id": 74,
        "language_id": 1,
        "description": "Balmaceda"
      },
      {
        "airport_id": 74,
        "language_id": 2,
        "description": "Balmaceda"
      },
      {
        "airport_id": 75,
        "language_id": 1,
        "description": "Calama"
      },
      {
        "airport_id": 75,
        "language_id": 2,
        "description": "Calama"
      },
      {
        "airport_id": 76,
        "language_id": 1,
        "description": "Easter Island"
      },
      {
        "airport_id": 76,
        "language_id": 2,
        "description": "Paaseiland"
      },
      {
        "airport_id": 77,
        "language_id": 1,
        "description": "Iquique"
      },
      {
        "airport_id": 77,
        "language_id": 2,
        "description": "Iquique"
      },
      {
        "airport_id": 78,
        "language_id": 1,
        "description": "La Serena"
      },
      {
        "airport_id": 78,
        "language_id": 2,
        "description": "La Serena"
      },
      {
        "airport_id": 79,
        "language_id": 1,
        "description": "Puerto Montt"
      },
      {
        "airport_id": 79,
        "language_id": 2,
        "description": "Puerto Montt"
      },
      {
        "airport_id": 80,
        "language_id": 1,
        "description": "Punta Arenas"
      },
      {
        "airport_id": 80,
        "language_id": 2,
        "description": "Punta Arenas"
      },
      {
        "airport_id": 81,
        "language_id": 1,
        "description": "Santiago de Chile"
      },
      {
        "airport_id": 81,
        "language_id": 2,
        "description": "Santiago de Chile"
      },
      {
        "airport_id": 82,
        "language_id": 1,
        "description": "Temuco"
      },
      {
        "airport_id": 82,
        "language_id": 2,
        "description": "Temuco"
      },
      {
        "airport_id": 83,
        "language_id": 1,
        "description": "Beijing"
      },
      {
        "airport_id": 83,
        "language_id": 2,
        "description": "Beijing"
      },
      {
        "airport_id": 84,
        "language_id": 1,
        "description": "Chengdu"
      },
      {
        "airport_id": 84,
        "language_id": 2,
        "description": "Chengdu"
      },
      {
        "airport_id": 85,
        "language_id": 1,
        "description": "Liberia"
      },
      {
        "airport_id": 85,
        "language_id": 2,
        "description": "Liberia"
      },
      {
        "airport_id": 86,
        "language_id": 1,
        "description": "Palmar"
      },
      {
        "airport_id": 86,
        "language_id": 2,
        "description": "Palmar"
      },
      {
        "airport_id": 87,
        "language_id": 1,
        "description": "Quepos"
      },
      {
        "airport_id": 87,
        "language_id": 2,
        "description": "Quepos"
      },
      {
        "airport_id": 88,
        "language_id": 1,
        "description": "San José"
      },
      {
        "airport_id": 88,
        "language_id": 2,
        "description": "San José"
      },
      {
        "airport_id": 89,
        "language_id": 1,
        "description": "Tambor"
      },
      {
        "airport_id": 89,
        "language_id": 2,
        "description": "Tambor"
      },
      {
        "airport_id": 90,
        "language_id": 1,
        "description": "Tortuguero"
      },
      {
        "airport_id": 90,
        "language_id": 2,
        "description": "Tortuguero"
      },
      {
        "airport_id": 91,
        "language_id": 1,
        "description": "Havana"
      },
      {
        "airport_id": 91,
        "language_id": 2,
        "description": "Havana"
      },
      {
        "airport_id": 92,
        "language_id": 1,
        "description": "Varadero"
      },
      {
        "airport_id": 92,
        "language_id": 2,
        "description": "Varadero"
      },
      {
        "airport_id": 93,
        "language_id": 1,
        "description": "Paphos"
      },
      {
        "airport_id": 93,
        "language_id": 2,
        "description": "Paphos"
      },
      {
        "airport_id": 94,
        "language_id": 1,
        "description": "Copenhagen"
      },
      {
        "airport_id": 94,
        "language_id": 2,
        "description": "Kopenhagen"
      },
      {
        "airport_id": 95,
        "language_id": 1,
        "description": "Dubai"
      },
      {
        "airport_id": 95,
        "language_id": 2,
        "description": "Dubai"
      },
      {
        "airport_id": 96,
        "language_id": 1,
        "description": "Dusseldorf"
      },
      {
        "airport_id": 96,
        "language_id": 2,
        "description": "Dusseldorf"
      },
      {
        "airport_id": 97,
        "language_id": 1,
        "description": "Frankfurt"
      },
      {
        "airport_id": 97,
        "language_id": 2,
        "description": "Frankfurt"
      },
      {
        "airport_id": 98,
        "language_id": 1,
        "description": "Hamburg"
      },
      {
        "airport_id": 98,
        "language_id": 2,
        "description": "Hamburg"
      },
      {
        "airport_id": 99,
        "language_id": 1,
        "description": "München"
      },
      {
        "airport_id": 99,
        "language_id": 2,
        "description": "München"
      },
      {
        "airport_id": 100,
        "language_id": 1,
        "description": "Weeze Düsseldorf"
      },
      {
        "airport_id": 100,
        "language_id": 2,
        "description": "Weeze Düsseldorf"
      },
      {
        "airport_id": 101,
        "language_id": 1,
        "description": "Coca"
      },
      {
        "airport_id": 101,
        "language_id": 2,
        "description": "Coca"
      },
      {
        "airport_id": 102,
        "language_id": 1,
        "description": "Cuenca Airport"
      },
      {
        "airport_id": 102,
        "language_id": 2,
        "description": "Vliegveld Cuenca"
      },
      {
        "airport_id": 103,
        "language_id": 1,
        "description": "Guayaquil"
      },
      {
        "airport_id": 103,
        "language_id": 2,
        "description": "Guayaquil"
      },
      {
        "airport_id": 104,
        "language_id": 1,
        "description": "Manta"
      },
      {
        "airport_id": 104,
        "language_id": 2,
        "description": "Manta"
      },
      {
        "airport_id": 105,
        "language_id": 1,
        "description": "Quito"
      },
      {
        "airport_id": 105,
        "language_id": 2,
        "description": "Quito"
      },
      {
        "airport_id": 106,
        "language_id": 1,
        "description": "Caïro"
      },
      {
        "airport_id": 106,
        "language_id": 2,
        "description": "Caïro"
      },
      {
        "airport_id": 107,
        "language_id": 1,
        "description": "Hurghada"
      },
      {
        "airport_id": 107,
        "language_id": 2,
        "description": "Hurghada"
      },
      {
        "airport_id": 108,
        "language_id": 1,
        "description": "Luxor"
      },
      {
        "airport_id": 108,
        "language_id": 2,
        "description": "Luxor"
      },
      {
        "airport_id": 109,
        "language_id": 1,
        "description": "Addis Ababa"
      },
      {
        "airport_id": 109,
        "language_id": 2,
        "description": "Addis Ababa"
      },
      {
        "airport_id": 110,
        "language_id": 1,
        "description": "Mount Pleasant"
      },
      {
        "airport_id": 110,
        "language_id": 2,
        "description": "Mount Pleasant"
      },
      {
        "airport_id": 111,
        "language_id": 1,
        "description": "Port Stanley"
      },
      {
        "airport_id": 111,
        "language_id": 2,
        "description": "Port Stanley"
      },
      {
        "airport_id": 112,
        "language_id": 1,
        "description": "Manila"
      },
      {
        "airport_id": 112,
        "language_id": 2,
        "description": "Manila"
      },
      {
        "airport_id": 113,
        "language_id": 1,
        "description": "Helsinki"
      },
      {
        "airport_id": 113,
        "language_id": 2,
        "description": "Helsinki"
      },
      {
        "airport_id": 114,
        "language_id": 1,
        "description": "Kajaani"
      },
      {
        "airport_id": 114,
        "language_id": 2,
        "description": "Kajaani"
      },
      {
        "airport_id": 115,
        "language_id": 1,
        "description": "Oulu"
      },
      {
        "airport_id": 115,
        "language_id": 2,
        "description": "Oulu"
      },
      {
        "airport_id": 116,
        "language_id": 1,
        "description": "Nice"
      },
      {
        "airport_id": 116,
        "language_id": 2,
        "description": "Nice"
      },
      {
        "airport_id": 117,
        "language_id": 1,
        "description": "Paris Charles de Gaulle"
      },
      {
        "airport_id": 117,
        "language_id": 2,
        "description": "Parijs Charles de Gaulle"
      },
      {
        "airport_id": 118,
        "language_id": 1,
        "description": "Paris Orly"
      },
      {
        "airport_id": 118,
        "language_id": 2,
        "description": "Parijs Orly"
      },
      {
        "airport_id": 119,
        "language_id": 1,
        "description": "Galápagos"
      },
      {
        "airport_id": 119,
        "language_id": 2,
        "description": "Galápagos"
      },
      {
        "airport_id": 120,
        "language_id": 1,
        "description": "San Cristóbal"
      },
      {
        "airport_id": 120,
        "language_id": 2,
        "description": "San Cristóbal"
      },
      {
        "airport_id": 121,
        "language_id": 1,
        "description": "Athens"
      },
      {
        "airport_id": 121,
        "language_id": 2,
        "description": "Athene"
      },
      {
        "airport_id": 122,
        "language_id": 1,
        "description": "Heraklion International Airport"
      },
      {
        "airport_id": 122,
        "language_id": 2,
        "description": "Internationaal Vliegveld Heraklion"
      },
      {
        "airport_id": 123,
        "language_id": 1,
        "description": "London Gatwick"
      },
      {
        "airport_id": 123,
        "language_id": 2,
        "description": "Londen Gatwick"
      },
      {
        "airport_id": 124,
        "language_id": 1,
        "description": "London Heathrow"
      },
      {
        "airport_id": 124,
        "language_id": 2,
        "description": "Londen Heathrow"
      },
      {
        "airport_id": 125,
        "language_id": 1,
        "description": "Flores"
      },
      {
        "airport_id": 125,
        "language_id": 2,
        "description": "Flores"
      },
      {
        "airport_id": 126,
        "language_id": 1,
        "description": "Guatamala-City"
      },
      {
        "airport_id": 126,
        "language_id": 2,
        "description": "Guatamala City"
      },
      {
        "airport_id": 127,
        "language_id": 1,
        "description": "Georgetown"
      },
      {
        "airport_id": 127,
        "language_id": 2,
        "description": "Georgetown"
      },
      {
        "airport_id": 128,
        "language_id": 1,
        "description": "Budapest"
      },
      {
        "airport_id": 128,
        "language_id": 2,
        "description": "Boedapest"
      },
      {
        "airport_id": 129,
        "language_id": 1,
        "description": "Hong Kong"
      },
      {
        "airport_id": 129,
        "language_id": 2,
        "description": "Hong Kong"
      },
      {
        "airport_id": 130,
        "language_id": 1,
        "description": "Dublin"
      },
      {
        "airport_id": 130,
        "language_id": 2,
        "description": "Dublin"
      },
      {
        "airport_id": 131,
        "language_id": 1,
        "description": "Akureyri"
      },
      {
        "airport_id": 131,
        "language_id": 2,
        "description": "Akureyri"
      },
      {
        "airport_id": 132,
        "language_id": 1,
        "description": "Reijkjavik"
      },
      {
        "airport_id": 132,
        "language_id": 2,
        "description": "Reijkjavik"
      },
      {
        "airport_id": 133,
        "language_id": 1,
        "description": "Reijkjavik national"
      },
      {
        "airport_id": 133,
        "language_id": 2,
        "description": "Reijkjavik nationaal"
      },
      {
        "airport_id": 134,
        "language_id": 1,
        "description": "Agatti Island"
      },
      {
        "airport_id": 134,
        "language_id": 2,
        "description": "Agatti Eiland"
      },
      {
        "airport_id": 135,
        "language_id": 1,
        "description": "Agra"
      },
      {
        "airport_id": 135,
        "language_id": 2,
        "description": "Agra"
      },
      {
        "airport_id": 136,
        "language_id": 1,
        "description": "Ahmedabad"
      },
      {
        "airport_id": 136,
        "language_id": 2,
        "description": "Ahmedabad"
      },
      {
        "airport_id": 137,
        "language_id": 1,
        "description": "Allahabad"
      },
      {
        "airport_id": 137,
        "language_id": 2,
        "description": "Allahabad"
      },
      {
        "airport_id": 138,
        "language_id": 1,
        "description": "Amritsar"
      },
      {
        "airport_id": 138,
        "language_id": 2,
        "description": "Amritsar"
      },
      {
        "airport_id": 139,
        "language_id": 1,
        "description": "Geneve"
      },
      {
        "airport_id": 139,
        "language_id": 2,
        "description": "Geneve"
      },
      {
        "airport_id": 140,
        "language_id": 1,
        "description": "Zurich"
      },
      {
        "airport_id": 140,
        "language_id": 2,
        "description": "Zurich"
      },
      {
        "airport_id": 141,
        "language_id": 1,
        "description": "Gotborg"
      },
      {
        "airport_id": 141,
        "language_id": 2,
        "description": "Gotborg"
      },
      {
        "airport_id": 142,
        "language_id": 1,
        "description": "Durban airport"
      },
      {
        "airport_id": 142,
        "language_id": 2,
        "description": "Durban vliegveld"
      },
      {
        "airport_id": 143,
        "language_id": 1,
        "description": "East London"
      },
      {
        "airport_id": 143,
        "language_id": 2,
        "description": "Oost London"
      },
      {
        "airport_id": 144,
        "language_id": 1,
        "description": "George airport"
      },
      {
        "airport_id": 144,
        "language_id": 2,
        "description": "George vliegveld"
      },
      {
        "airport_id": 145,
        "language_id": 1,
        "description": "Hoedspruit"
      },
      {
        "airport_id": 145,
        "language_id": 2,
        "description": "Hoedspruit"
      },
      {
        "airport_id": 146,
        "language_id": 1,
        "description": "Kruger Mpumalanga International Airport"
      },
      {
        "airport_id": 146,
        "language_id": 2,
        "description": "Kruger Mpumalanga International Airport"
      },
      {
        "airport_id": 147,
        "language_id": 1,
        "description": "Johannesburg O.R. Tambo Airport"
      },
      {
        "airport_id": 147,
        "language_id": 2,
        "description": "Johannesburg O.R. Tambo Airport"
      },
      {
        "airport_id": 148,
        "language_id": 1,
        "description": "Phalaborwa Airport"
      },
      {
        "airport_id": 148,
        "language_id": 2,
        "description": "Phalaborwa vliegveld"
      },
      {
        "airport_id": 149,
        "language_id": 1,
        "description": "Polokwane"
      },
      {
        "airport_id": 149,
        "language_id": 2,
        "description": "Polokwane"
      },
      {
        "airport_id": 150,
        "language_id": 1,
        "description": "Port Elizabeth Airport"
      },
      {
        "airport_id": 150,
        "language_id": 2,
        "description": "Port Elizabeth Airport"
      },
      {
        "airport_id": 151,
        "language_id": 1,
        "description": "Richards Bay Airport"
      },
      {
        "airport_id": 151,
        "language_id": 2,
        "description": "Richards Bay Airport"
      },
      {
        "airport_id": 152,
        "language_id": 1,
        "description": "Skukuza Airport"
      },
      {
        "airport_id": 152,
        "language_id": 2,
        "description": "Skukuza vliegveld"
      },
      {
        "airport_id": 153,
        "language_id": 1,
        "description": "Umtata"
      },
      {
        "airport_id": 153,
        "language_id": 2,
        "description": "Umtata"
      },
      {
        "airport_id": 154,
        "language_id": 1,
        "description": "Upington"
      },
      {
        "airport_id": 154,
        "language_id": 2,
        "description": "Upington"
      },
      {
        "airport_id": 155,
        "language_id": 1,
        "description": "Harare Airport"
      },
      {
        "airport_id": 155,
        "language_id": 2,
        "description": "Harare"
      },
      {
        "airport_id": 156,
        "language_id": 1,
        "description": "Victoria Falls Airport"
      },
      {
        "airport_id": 156,
        "language_id": 2,
        "description": "Victoria Falls Airport"
      },
      {
        "airport_id": 157,
        "language_id": 1,
        "description": "Livingstone Airport"
      },
      {
        "airport_id": 157,
        "language_id": 2,
        "description": "Livingstone Airport"
      },
      {
        "airport_id": 158,
        "language_id": 1,
        "description": "Lusaka Airport"
      },
      {
        "airport_id": 158,
        "language_id": 2,
        "description": "Lusaka Airport"
      },
      {
        "airport_id": 159,
        "language_id": 1,
        "description": "Mfuwe Airport"
      },
      {
        "airport_id": 159,
        "language_id": 2,
        "description": "Mfuwe vliegveld"
      },
      {
        "airport_id": 160,
        "language_id": 1,
        "description": "Hanoi"
      },
      {
        "airport_id": 160,
        "language_id": 2,
        "description": "Hanoi"
      },
      {
        "airport_id": 161,
        "language_id": 1,
        "description": "Ho Chi Minh City Airport"
      },
      {
        "airport_id": 161,
        "language_id": 2,
        "description": "Ho Chi Minh City vliegveld"
      },
      {
        "airport_id": 162,
        "language_id": 1,
        "description": "Nha Trang Airport"
      },
      {
        "airport_id": 162,
        "language_id": 2,
        "description": "Nha Trang vliegveld"
      },
      {
        "airport_id": 163,
        "language_id": 1,
        "description": "Montevideo"
      },
      {
        "airport_id": 163,
        "language_id": 2,
        "description": "Montevideo"
      },
      {
        "airport_id": 164,
        "language_id": 1,
        "description": "Punta del Este"
      },
      {
        "airport_id": 164,
        "language_id": 2,
        "description": "Punta del Este"
      },
      {
        "airport_id": 165,
        "language_id": 1,
        "description": "Atlanta"
      },
      {
        "airport_id": 165,
        "language_id": 2,
        "description": "Atlanta"
      },
      {
        "airport_id": 166,
        "language_id": 1,
        "description": "Bozeman Montana"
      },
      {
        "airport_id": 166,
        "language_id": 2,
        "description": "Bozeman Montana"
      },
      {
        "airport_id": 167,
        "language_id": 1,
        "description": "Houston"
      },
      {
        "airport_id": 167,
        "language_id": 2,
        "description": "Houston"
      },
      {
        "airport_id": 168,
        "language_id": 1,
        "description": "Jackson Hole Wyoming"
      },
      {
        "airport_id": 168,
        "language_id": 2,
        "description": "Jackson Hole Wyoming"
      },
      {
        "airport_id": 169,
        "language_id": 1,
        "description": "Juneau"
      },
      {
        "airport_id": 169,
        "language_id": 2,
        "description": "Juneau"
      },
      {
        "airport_id": 170,
        "language_id": 1,
        "description": "Miami"
      },
      {
        "airport_id": 170,
        "language_id": 2,
        "description": "Miami"
      },
      {
        "airport_id": 171,
        "language_id": 1,
        "description": "Minneapolis"
      },
      {
        "airport_id": 171,
        "language_id": 2,
        "description": "Minneapolis"
      },
      {
        "airport_id": 172,
        "language_id": 1,
        "description": "New York JFK Airport"
      },
      {
        "airport_id": 172,
        "language_id": 2,
        "description": "New York JFK Airport"
      },
      {
        "airport_id": 173,
        "language_id": 1,
        "description": "Chicago O'Hare Airport"
      },
      {
        "airport_id": 173,
        "language_id": 2,
        "description": "Chicago O'Hare Airport"
      },
      {
        "airport_id": 174,
        "language_id": 1,
        "description": "Orlando"
      },
      {
        "airport_id": 174,
        "language_id": 2,
        "description": "Orlando"
      },
      {
        "airport_id": 175,
        "language_id": 1,
        "description": "Salt Lake City"
      },
      {
        "airport_id": 175,
        "language_id": 2,
        "description": "Salt Lake City"
      },
      {
        "airport_id": 176,
        "language_id": 1,
        "description": "San Francisco"
      },
      {
        "airport_id": 176,
        "language_id": 2,
        "description": "San Francisco"
      },
      {
        "airport_id": 177,
        "language_id": 1,
        "description": "Seattle"
      },
      {
        "airport_id": 177,
        "language_id": 2,
        "description": "Seattle"
      },
      {
        "airport_id": 178,
        "language_id": 1,
        "description": "Sitka"
      },
      {
        "airport_id": 178,
        "language_id": 2,
        "description": "Sitka"
      },
      {
        "airport_id": 179,
        "language_id": 1,
        "description": "Turks Caicos"
      },
      {
        "airport_id": 179,
        "language_id": 2,
        "description": "Turks Caicos"
      },
      {
        "airport_id": 180,
        "language_id": 1,
        "description": "Antalya"
      },
      {
        "airport_id": 180,
        "language_id": 2,
        "description": "Antalya"
      },
      {
        "airport_id": 181,
        "language_id": 1,
        "description": "Bodrum"
      },
      {
        "airport_id": 181,
        "language_id": 2,
        "description": "Bodrum"
      },
      {
        "airport_id": 182,
        "language_id": 1,
        "description": "Istanbul"
      },
      {
        "airport_id": 182,
        "language_id": 2,
        "description": "Istanbul"
      },
      {
        "airport_id": 183,
        "language_id": 1,
        "description": "Bangkok Don Muang Airport"
      },
      {
        "airport_id": 183,
        "language_id": 2,
        "description": "Bangkok Don Muang vliegveld"
      },
      {
        "airport_id": 184,
        "language_id": 1,
        "description": "BangkokSuvarnabhumi International Airport"
      },
      {
        "airport_id": 184,
        "language_id": 2,
        "description": "BangkokSuvarnabhumi International Airport"
      },
      {
        "airport_id": 185,
        "language_id": 1,
        "description": "Chiang Mai"
      },
      {
        "airport_id": 185,
        "language_id": 2,
        "description": "Chiang Mai"
      },
      {
        "airport_id": 186,
        "language_id": 1,
        "description": "Chiang Rai"
      },
      {
        "airport_id": 186,
        "language_id": 2,
        "description": "Chiang Rai"
      },
      {
        "airport_id": 187,
        "language_id": 1,
        "description": "Koh Samui Airport"
      },
      {
        "airport_id": 187,
        "language_id": 2,
        "description": "Koh Samui Airport"
      },
      {
        "airport_id": 188,
        "language_id": 1,
        "description": "Phuket Airport"
      },
      {
        "airport_id": 188,
        "language_id": 2,
        "description": "Phuket vliegveld"
      },
      {
        "airport_id": 189,
        "language_id": 1,
        "description": "Arusha Airport"
      },
      {
        "airport_id": 189,
        "language_id": 2,
        "description": "Arusha vliegveld"
      },
      {
        "airport_id": 190,
        "language_id": 1,
        "description": "Dar es Salaam Airport"
      },
      {
        "airport_id": 190,
        "language_id": 2,
        "description": "Dar es Salaam Airport"
      },
      {
        "airport_id": 191,
        "language_id": 1,
        "description": "Kilimanjaro International Airport"
      },
      {
        "airport_id": 191,
        "language_id": 2,
        "description": "Kilimanjaro International Airport"
      },
      {
        "airport_id": 192,
        "language_id": 1,
        "description": "Lake Manyara"
      },
      {
        "airport_id": 192,
        "language_id": 2,
        "description": "Lake Manyara"
      },
      {
        "airport_id": 193,
        "language_id": 1,
        "description": "Serengeti Seronera"
      },
      {
        "airport_id": 193,
        "language_id": 2,
        "description": "Serengeti Seronera"
      },
      {
        "airport_id": 194,
        "language_id": 1,
        "description": "Zanzibar Airport"
      },
      {
        "airport_id": 194,
        "language_id": 2,
        "description": "Zanzibar"
      },
      {
        "airport_id": 195,
        "language_id": 1,
        "description": "Taipei"
      },
      {
        "airport_id": 195,
        "language_id": 2,
        "description": "Taipei"
      },
      {
        "airport_id": 196,
        "language_id": 1,
        "description": "Paramaribo"
      },
      {
        "airport_id": 196,
        "language_id": 2,
        "description": "Paramaribo"
      },
      {
        "airport_id": 197,
        "language_id": 1,
        "description": "St. Lucia"
      },
      {
        "airport_id": 197,
        "language_id": 2,
        "description": "St. Lucia"
      },
      {
        "airport_id": 198,
        "language_id": 1,
        "description": "St. Barth"
      },
      {
        "airport_id": 198,
        "language_id": 2,
        "description": "St. Barth"
      },
      {
        "airport_id": 199,
        "language_id": 1,
        "description": "Colombo"
      },
      {
        "airport_id": 199,
        "language_id": 2,
        "description": "Colombo"
      },
      {
        "airport_id": 200,
        "language_id": 1,
        "description": "Longyearbyen"
      },
      {
        "airport_id": 200,
        "language_id": 2,
        "description": "Longyearbyen"
      },
      {
        "airport_id": 201,
        "language_id": 1,
        "description": "Barcelona"
      },
      {
        "airport_id": 201,
        "language_id": 2,
        "description": "Barcelona"
      },
      {
        "airport_id": 202,
        "language_id": 1,
        "description": "Madrid Airport"
      },
      {
        "airport_id": 202,
        "language_id": 2,
        "description": "Madrid Airport"
      },
      {
        "airport_id": 203,
        "language_id": 1,
        "description": "Malaga"
      },
      {
        "airport_id": 203,
        "language_id": 2,
        "description": "Malaga"
      },
      {
        "airport_id": 204,
        "language_id": 1,
        "description": "Palma de Mallorca"
      },
      {
        "airport_id": 204,
        "language_id": 2,
        "description": "Palma de Mallorca"
      },
      {
        "airport_id": 205,
        "language_id": 1,
        "description": "Tenerife"
      },
      {
        "airport_id": 205,
        "language_id": 2,
        "description": "Tenerife"
      },
      {
        "airport_id": 206,
        "language_id": 1,
        "description": "Singapore Airport"
      },
      {
        "airport_id": 206,
        "language_id": 2,
        "description": "Singapore Airport"
      },
      {
        "airport_id": 207,
        "language_id": 1,
        "description": "Praslin Airport"
      },
      {
        "airport_id": 207,
        "language_id": 2,
        "description": "Praslin vliegveld"
      },
      {
        "airport_id": 208,
        "language_id": 1,
        "description": "Seychelles International Airport"
      },
      {
        "airport_id": 208,
        "language_id": 2,
        "description": "Seychelles International Airport"
      },
      {
        "airport_id": 209,
        "language_id": 1,
        "description": "Kigali Airport"
      },
      {
        "airport_id": 209,
        "language_id": 2,
        "description": "Kigali vliegveld"
      },
      {
        "airport_id": 210,
        "language_id": 1,
        "description": "Anadyr"
      },
      {
        "airport_id": 210,
        "language_id": 2,
        "description": "Anadyr"
      },
      {
        "airport_id": 211,
        "language_id": 1,
        "description": "Moermansk"
      },
      {
        "airport_id": 211,
        "language_id": 2,
        "description": "Moermansk"
      },
      {
        "airport_id": 212,
        "language_id": 1,
        "description": "Moscow"
      },
      {
        "airport_id": 212,
        "language_id": 2,
        "description": "Moscow"
      },
      {
        "airport_id": 213,
        "language_id": 1,
        "description": "Petropavlovsk"
      },
      {
        "airport_id": 213,
        "language_id": 2,
        "description": "Petropavlovsk"
      },
      {
        "airport_id": 214,
        "language_id": 1,
        "description": "St. Petersburg"
      },
      {
        "airport_id": 214,
        "language_id": 2,
        "description": "St. Petersburg"
      },
      {
        "airport_id": 215,
        "language_id": 1,
        "description": "Rodrigues"
      },
      {
        "airport_id": 215,
        "language_id": 2,
        "description": "Rodrigues"
      },
      {
        "airport_id": 216,
        "language_id": 1,
        "description": "Doha"
      },
      {
        "airport_id": 216,
        "language_id": 2,
        "description": "Doha"
      },
      {
        "airport_id": 217,
        "language_id": 1,
        "description": "Faro"
      },
      {
        "airport_id": 217,
        "language_id": 2,
        "description": "Faro"
      },
      {
        "airport_id": 218,
        "language_id": 1,
        "description": "Horta"
      },
      {
        "airport_id": 218,
        "language_id": 2,
        "description": "Horta"
      },
      {
        "airport_id": 219,
        "language_id": 1,
        "description": "Lissabon"
      },
      {
        "airport_id": 219,
        "language_id": 2,
        "description": "Lissabon"
      },
      {
        "airport_id": 220,
        "language_id": 1,
        "description": "Arequipa"
      },
      {
        "airport_id": 220,
        "language_id": 2,
        "description": "Arequipa"
      },
      {
        "airport_id": 221,
        "language_id": 1,
        "description": "Cajamarca"
      },
      {
        "airport_id": 221,
        "language_id": 2,
        "description": "Cajamarca"
      },
      {
        "airport_id": 222,
        "language_id": 1,
        "description": "Chiclayo"
      },
      {
        "airport_id": 222,
        "language_id": 2,
        "description": "Chiclayo"
      },
      {
        "airport_id": 223,
        "language_id": 1,
        "description": "Cusco"
      },
      {
        "airport_id": 223,
        "language_id": 2,
        "description": "Cusco"
      },
      {
        "airport_id": 224,
        "language_id": 1,
        "description": "Iquitos"
      },
      {
        "airport_id": 224,
        "language_id": 2,
        "description": "Iquitos"
      },
      {
        "airport_id": 225,
        "language_id": 1,
        "description": "Juliaca"
      },
      {
        "airport_id": 225,
        "language_id": 2,
        "description": "Juliaca"
      },
      {
        "airport_id": 226,
        "language_id": 1,
        "description": "Lima Airport"
      },
      {
        "airport_id": 226,
        "language_id": 2,
        "description": "Lima Airport"
      },
      {
        "airport_id": 227,
        "language_id": 1,
        "description": "Puerto Maldonado"
      },
      {
        "airport_id": 227,
        "language_id": 2,
        "description": "Puerto Maldonado"
      },
      {
        "airport_id": 228,
        "language_id": 1,
        "description": "Tarapoto"
      },
      {
        "airport_id": 228,
        "language_id": 2,
        "description": "Tarapoto"
      },
      {
        "airport_id": 229,
        "language_id": 1,
        "description": "Trujillo"
      },
      {
        "airport_id": 229,
        "language_id": 2,
        "description": "Trujillo"
      },
      {
        "airport_id": 230,
        "language_id": 1,
        "description": "Asuncion"
      },
      {
        "airport_id": 230,
        "language_id": 2,
        "description": "Asuncion"
      },
      {
        "airport_id": 231,
        "language_id": 1,
        "description": "Bocas del Toro"
      },
      {
        "airport_id": 231,
        "language_id": 2,
        "description": "Bocas del Toro"
      },
      {
        "airport_id": 232,
        "language_id": 1,
        "description": "David"
      },
      {
        "airport_id": 232,
        "language_id": 2,
        "description": "David"
      },
      {
        "airport_id": 233,
        "language_id": 1,
        "description": "Panama City"
      },
      {
        "airport_id": 233,
        "language_id": 2,
        "description": "Panama Stad"
      },
      {
        "airport_id": 234,
        "language_id": 1,
        "description": "Panama-City National"
      },
      {
        "airport_id": 234,
        "language_id": 2,
        "description": "Panama-Stad Nationaal"
      },
      {
        "airport_id": 235,
        "language_id": 1,
        "description": "San Blas"
      },
      {
        "airport_id": 235,
        "language_id": 2,
        "description": "San Blas"
      },
      {
        "airport_id": 236,
        "language_id": 1,
        "description": "Innsbruck"
      },
      {
        "airport_id": 236,
        "language_id": 2,
        "description": "Innsbruck"
      },
      {
        "airport_id": 237,
        "language_id": 1,
        "description": "Wenen"
      },
      {
        "airport_id": 237,
        "language_id": 2,
        "description": "Wenen"
      },
      {
        "airport_id": 238,
        "language_id": 1,
        "description": "Oman Seeb Airport"
      },
      {
        "airport_id": 238,
        "language_id": 2,
        "description": "Oman Seeb vliegveld"
      },
      {
        "airport_id": 239,
        "language_id": 1,
        "description": "Kiev"
      },
      {
        "airport_id": 239,
        "language_id": 2,
        "description": "Kiev"
      },
      {
        "airport_id": 240,
        "language_id": 1,
        "description": "Kiev"
      },
      {
        "airport_id": 240,
        "language_id": 2,
        "description": "Kiev"
      },
      {
        "airport_id": 241,
        "language_id": 1,
        "description": "Entebbe Airport"
      },
      {
        "airport_id": 241,
        "language_id": 2,
        "description": "Entebbe vliegveld"
      },
      {
        "airport_id": 242,
        "language_id": 1,
        "description": "Bergen"
      },
      {
        "airport_id": 242,
        "language_id": 2,
        "description": "Bergen"
      },
      {
        "airport_id": 243,
        "language_id": 1,
        "description": "Oslo"
      },
      {
        "airport_id": 243,
        "language_id": 2,
        "description": "Oslo"
      },
      {
        "airport_id": 244,
        "language_id": 1,
        "description": "Tromso"
      },
      {
        "airport_id": 244,
        "language_id": 2,
        "description": "Tromso"
      },
      {
        "airport_id": 245,
        "language_id": 1,
        "description": "Auckland Airport"
      },
      {
        "airport_id": 245,
        "language_id": 2,
        "description": "Auckland Airport"
      },
      {
        "airport_id": 246,
        "language_id": 1,
        "description": "Christchurch Airport"
      },
      {
        "airport_id": 246,
        "language_id": 2,
        "description": "Christchurch Airport"
      },
      {
        "airport_id": 247,
        "language_id": 1,
        "description": "Wellington"
      },
      {
        "airport_id": 247,
        "language_id": 2,
        "description": "Wellington"
      },
      {
        "airport_id": 248,
        "language_id": 1,
        "description": "Kathmandu"
      },
      {
        "airport_id": 248,
        "language_id": 2,
        "description": "Kathmandu"
      },
      {
        "airport_id": 249,
        "language_id": 1,
        "description": "Meghauli"
      },
      {
        "airport_id": 249,
        "language_id": 2,
        "description": "Meghauli"
      },
      {
        "airport_id": 250,
        "language_id": 1,
        "description": "Aruba"
      },
      {
        "airport_id": 250,
        "language_id": 2,
        "description": "Aruba"
      },
      {
        "airport_id": 251,
        "language_id": 1,
        "description": "Bonaire Flamingo international"
      },
      {
        "airport_id": 251,
        "language_id": 2,
        "description": "Bonaire Flamingo internationaal"
      },
      {
        "airport_id": 252,
        "language_id": 1,
        "description": "Curaçao Hato International"
      },
      {
        "airport_id": 252,
        "language_id": 2,
        "description": "Curaçao Hato International"
      },
      {
        "airport_id": 253,
        "language_id": 1,
        "description": "St. Maarten International"
      },
      {
        "airport_id": 253,
        "language_id": 2,
        "description": "St. Maarten Internationaal"
      },
      {
        "airport_id": 254,
        "language_id": 1,
        "description": "Eindhoven"
      },
      {
        "airport_id": 254,
        "language_id": 2,
        "description": "Eindhoven"
      },
      {
        "airport_id": 255,
        "language_id": 1,
        "description": "Maastricht"
      },
      {
        "airport_id": 255,
        "language_id": 2,
        "description": "Maastricht"
      },
      {
        "airport_id": 256,
        "language_id": 1,
        "description": "Rotterdam"
      },
      {
        "airport_id": 256,
        "language_id": 2,
        "description": "Rotterdam"
      },
      {
        "airport_id": 257,
        "language_id": 1,
        "description": "Windhoek Airport"
      },
      {
        "airport_id": 257,
        "language_id": 2,
        "description": "Windhoek Airport"
      },
      {
        "airport_id": 258,
        "language_id": 1,
        "description": "Mustique"
      },
      {
        "airport_id": 258,
        "language_id": 2,
        "description": "Mustique"
      },
      {
        "airport_id": 259,
        "language_id": 1,
        "description": "Maputo Airport"
      },
      {
        "airport_id": 259,
        "language_id": 2,
        "description": "Maputo Airport"
      },
      {
        "airport_id": 260,
        "language_id": 1,
        "description": "Pemba Airport"
      },
      {
        "airport_id": 260,
        "language_id": 2,
        "description": "Pemba vliegveld"
      },
      {
        "airport_id": 261,
        "language_id": 1,
        "description": "Vilanculos Airport"
      },
      {
        "airport_id": 261,
        "language_id": 2,
        "description": "Vilanculos Airport"
      },
      {
        "airport_id": 262,
        "language_id": 1,
        "description": "Acapulco"
      },
      {
        "airport_id": 262,
        "language_id": 2,
        "description": "Acapulco"
      },
      {
        "airport_id": 263,
        "language_id": 1,
        "description": "Cancún International"
      },
      {
        "airport_id": 263,
        "language_id": 2,
        "description": "Cancún Internationaal"
      },
      {
        "airport_id": 264,
        "language_id": 1,
        "description": "Chihuahua"
      },
      {
        "airport_id": 264,
        "language_id": 2,
        "description": "Chihuahua"
      },
      {
        "airport_id": 265,
        "language_id": 1,
        "description": "Guadalajara"
      },
      {
        "airport_id": 265,
        "language_id": 2,
        "description": "Guadalajara"
      },
      {
        "airport_id": 266,
        "language_id": 1,
        "description": "Ixtapa-Zihuatanejo"
      },
      {
        "airport_id": 266,
        "language_id": 2,
        "description": "Ixtapa-Zihuatanejo"
      },
      {
        "airport_id": 267,
        "language_id": 1,
        "description": "La Paz Mexico"
      },
      {
        "airport_id": 267,
        "language_id": 2,
        "description": "La Paz Mexico"
      },
      {
        "airport_id": 268,
        "language_id": 1,
        "description": "Leon"
      },
      {
        "airport_id": 268,
        "language_id": 2,
        "description": "Leon"
      },
      {
        "airport_id": 269,
        "language_id": 1,
        "description": "Los Mochis"
      },
      {
        "airport_id": 269,
        "language_id": 2,
        "description": "Los Mochis"
      },
      {
        "airport_id": 270,
        "language_id": 1,
        "description": "Mexico-City International"
      },
      {
        "airport_id": 270,
        "language_id": 2,
        "description": "Mexico-Stad Internationaal"
      },
      {
        "airport_id": 271,
        "language_id": 1,
        "description": "Mérida"
      },
      {
        "airport_id": 271,
        "language_id": 2,
        "description": "Mérida"
      },
      {
        "airport_id": 272,
        "language_id": 1,
        "description": "Oaxaca"
      },
      {
        "airport_id": 272,
        "language_id": 2,
        "description": "Oaxaca"
      },
      {
        "airport_id": 273,
        "language_id": 1,
        "description": "Puerto Vallarta"
      },
      {
        "airport_id": 273,
        "language_id": 2,
        "description": "Puerto Vallarta"
      },
      {
        "airport_id": 274,
        "language_id": 1,
        "description": "San Diego"
      },
      {
        "airport_id": 274,
        "language_id": 2,
        "description": "San Diego"
      },
      {
        "airport_id": 275,
        "language_id": 1,
        "description": "San José Cabo San Lucas"
      },
      {
        "airport_id": 275,
        "language_id": 2,
        "description": "San José Cabo San Lucas"
      },
      {
        "airport_id": 276,
        "language_id": 1,
        "description": "Tijuana"
      },
      {
        "airport_id": 276,
        "language_id": 2,
        "description": "Tijuana"
      },
      {
        "airport_id": 277,
        "language_id": 1,
        "description": "Tuxtla Gutierrez"
      },
      {
        "airport_id": 277,
        "language_id": 2,
        "description": "Tuxtla Gutierrez"
      },
      {
        "airport_id": 278,
        "language_id": 1,
        "description": "Villahermosa"
      },
      {
        "airport_id": 278,
        "language_id": 2,
        "description": "Villahermosa"
      },
      {
        "airport_id": 279,
        "language_id": 1,
        "description": "Mauritius Airport"
      },
      {
        "airport_id": 279,
        "language_id": 2,
        "description": "Mauritius Airport"
      },
      {
        "airport_id": 280,
        "language_id": 1,
        "description": "Casablanca Mohamed V Airport"
      },
      {
        "airport_id": 280,
        "language_id": 2,
        "description": "Casablanca Mohamed V Airport Casablanca Mohamed V vliegveld"
      },
      {
        "airport_id": 281,
        "language_id": 1,
        "description": "Marrakech Airport"
      },
      {
        "airport_id": 281,
        "language_id": 2,
        "description": "Marrakech vliegveld"
      },
      {
        "airport_id": 282,
        "language_id": 1,
        "description": "Kuala Lumpur International Airport (KLIA)"
      },
      {
        "airport_id": 282,
        "language_id": 2,
        "description": "Kuala Lumpur International Airport (KLIA)"
      },
      {
        "airport_id": 283,
        "language_id": 1,
        "description": "Malé International Airport"
      },
      {
        "airport_id": 283,
        "language_id": 2,
        "description": "Malé International Airport"
      },
      {
        "airport_id": 284,
        "language_id": 1,
        "description": "Lilongwe Airport"
      },
      {
        "airport_id": 284,
        "language_id": 2,
        "description": "Lilongwe Airport"
      },
      {
        "airport_id": 285,
        "language_id": 1,
        "description": "Tripoli"
      },
      {
        "airport_id": 285,
        "language_id": 2,
        "description": "Tripoli"
      },
      {
        "airport_id": 286,
        "language_id": 1,
        "description": "La Réunion Airport"
      },
      {
        "airport_id": 286,
        "language_id": 2,
        "description": "La Réunion Airport"
      },
      {
        "airport_id": 287,
        "language_id": 1,
        "description": "Amboseli"
      },
      {
        "airport_id": 287,
        "language_id": 2,
        "description": "Amboseli"
      },
      {
        "airport_id": 288,
        "language_id": 1,
        "description": "Jomo Kenyatta International Airport"
      },
      {
        "airport_id": 288,
        "language_id": 2,
        "description": "Jomo Kenyatta International Airport"
      },
      {
        "airport_id": 289,
        "language_id": 1,
        "description": "Kisumu"
      },
      {
        "airport_id": 289,
        "language_id": 2,
        "description": "Kisumu"
      },
      {
        "airport_id": 290,
        "language_id": 1,
        "description": "Lamu Airport"
      },
      {
        "airport_id": 290,
        "language_id": 2,
        "description": "Lamu vliegveld"
      },
      {
        "airport_id": 291,
        "language_id": 1,
        "description": "Malindi Airport"
      },
      {
        "airport_id": 291,
        "language_id": 2,
        "description": "Malindi vliegveld"
      },
      {
        "airport_id": 292,
        "language_id": 1,
        "description": "Mombasa Airport"
      },
      {
        "airport_id": 292,
        "language_id": 2,
        "description": "Mombasa vliegveld"
      },
      {
        "airport_id": 293,
        "language_id": 1,
        "description": "Nanyuki"
      },
      {
        "airport_id": 293,
        "language_id": 2,
        "description": "Nanyuki"
      },
      {
        "airport_id": 294,
        "language_id": 1,
        "description": "Samburu"
      },
      {
        "airport_id": 294,
        "language_id": 2,
        "description": "Samburu"
      },
      {
        "airport_id": 295,
        "language_id": 1,
        "description": "Wilson Airport"
      },
      {
        "airport_id": 295,
        "language_id": 2,
        "description": "Wilson vliegveld"
      },
      {
        "airport_id": 296,
        "language_id": 1,
        "description": "Amman"
      },
      {
        "airport_id": 296,
        "language_id": 2,
        "description": "Amman"
      },
      {
        "airport_id": 297,
        "language_id": 1,
        "description": "Shikoku Island"
      },
      {
        "airport_id": 297,
        "language_id": 2,
        "description": "Shikoku Island"
      },
      {
        "airport_id": 298,
        "language_id": 1,
        "description": "Tokyo Haneda"
      },
      {
        "airport_id": 298,
        "language_id": 2,
        "description": "Tokyo Haneda"
      },
      {
        "airport_id": 299,
        "language_id": 1,
        "description": "Tokyo Narita"
      },
      {
        "airport_id": 299,
        "language_id": 2,
        "description": "Tokyo Narita"
      },
      {
        "airport_id": 300,
        "language_id": 1,
        "description": "Bari"
      },
      {
        "airport_id": 300,
        "language_id": 2,
        "description": "Bari"
      },
      {
        "airport_id": 301,
        "language_id": 1,
        "description": "Milan"
      },
      {
        "airport_id": 301,
        "language_id": 2,
        "description": "Milaan"
      },
      {
        "airport_id": 302,
        "language_id": 1,
        "description": "Milan Linate"
      },
      {
        "airport_id": 302,
        "language_id": 2,
        "description": "Milaan Linate"
      },
      {
        "airport_id": 303,
        "language_id": 1,
        "description": "Rome"
      },
      {
        "airport_id": 303,
        "language_id": 2,
        "description": "Rome"
      },
      {
        "airport_id": 304,
        "language_id": 1,
        "description": "Denpasar"
      },
      {
        "airport_id": 304,
        "language_id": 2,
        "description": "Denpasar"
      },
      {
        "airport_id": 305,
        "language_id": 1,
        "description": "Jakarta"
      },
      {
        "airport_id": 305,
        "language_id": 2,
        "description": "Jakarta"
      },
      {
        "airport_id": 306,
        "language_id": 1,
        "description": "Varanasi"
      },
      {
        "airport_id": 306,
        "language_id": 2,
        "description": "Varanasi"
      },
      {
        "airport_id": 307,
        "language_id": 1,
        "description": "Udaipur"
      },
      {
        "airport_id": 307,
        "language_id": 2,
        "description": "Udaipur"
      },
      {
        "airport_id": 308,
        "language_id": 1,
        "description": "Thiruvananthapuram"
      },
      {
        "airport_id": 308,
        "language_id": 2,
        "description": "Thiruvananthapuram"
      },
      {
        "airport_id": 309,
        "language_id": 1,
        "description": "Simla"
      },
      {
        "airport_id": 309,
        "language_id": 2,
        "description": "Simla"
      },
      {
        "airport_id": 310,
        "language_id": 1,
        "description": "Raipur"
      },
      {
        "airport_id": 310,
        "language_id": 2,
        "description": "Raipur"
      },
      {
        "airport_id": 311,
        "language_id": 1,
        "description": "Port Blair"
      },
      {
        "airport_id": 311,
        "language_id": 2,
        "description": "Port Blair"
      },
      {
        "airport_id": 312,
        "language_id": 1,
        "description": "Nagpur"
      },
      {
        "airport_id": 312,
        "language_id": 2,
        "description": "Nagpur"
      },
      {
        "airport_id": 313,
        "language_id": 1,
        "description": "Mysore"
      },
      {
        "airport_id": 313,
        "language_id": 2,
        "description": "Mysore"
      },
      {
        "airport_id": 314,
        "language_id": 1,
        "description": "Mumbai (Bombay)"
      },
      {
        "airport_id": 314,
        "language_id": 2,
        "description": "Mumbai (Bombay)"
      },
      {
        "airport_id": 315,
        "language_id": 1,
        "description": "Mangalore"
      },
      {
        "airport_id": 315,
        "language_id": 2,
        "description": "Mangalore"
      },
      {
        "airport_id": 316,
        "language_id": 1,
        "description": "Madurai"
      },
      {
        "airport_id": 316,
        "language_id": 2,
        "description": "Madurai"
      },
      {
        "airport_id": 317,
        "language_id": 1,
        "description": "Leh"
      },
      {
        "airport_id": 317,
        "language_id": 2,
        "description": "Leh"
      },
      {
        "airport_id": 318,
        "language_id": 1,
        "description": "Kozhikode"
      },
      {
        "airport_id": 318,
        "language_id": 2,
        "description": "Kozhikode"
      },
      {
        "airport_id": 319,
        "language_id": 1,
        "description": "Kolkata"
      },
      {
        "airport_id": 319,
        "language_id": 2,
        "description": "Kolkata"
      },
      {
        "airport_id": 320,
        "language_id": 1,
        "description": "Kochi"
      },
      {
        "airport_id": 320,
        "language_id": 2,
        "description": "Kochi"
      },
      {
        "airport_id": 321,
        "language_id": 1,
        "description": "Khajuraho"
      },
      {
        "airport_id": 321,
        "language_id": 2,
        "description": "Khajuraho"
      },
      {
        "airport_id": 322,
        "language_id": 1,
        "description": "Jorhat"
      },
      {
        "airport_id": 322,
        "language_id": 2,
        "description": "Jorhat"
      },
      {
        "airport_id": 323,
        "language_id": 1,
        "description": "Jodhpur"
      },
      {
        "airport_id": 323,
        "language_id": 2,
        "description": "Jodhpur"
      },
      {
        "airport_id": 324,
        "language_id": 1,
        "description": "Jaipur"
      },
      {
        "airport_id": 324,
        "language_id": 2,
        "description": "Jaipur"
      },
      {
        "airport_id": 325,
        "language_id": 1,
        "description": "Jabalpur"
      },
      {
        "airport_id": 325,
        "language_id": 2,
        "description": "Jabalpur"
      },
      {
        "airport_id": 326,
        "language_id": 1,
        "description": "Hyderabad"
      },
      {
        "airport_id": 326,
        "language_id": 2,
        "description": "Hyderabad"
      },
      {
        "airport_id": 327,
        "language_id": 1,
        "description": "Gwalior"
      },
      {
        "airport_id": 327,
        "language_id": 2,
        "description": "Gwalior"
      },
      {
        "airport_id": 328,
        "language_id": 1,
        "description": "Guwahati"
      },
      {
        "airport_id": 328,
        "language_id": 2,
        "description": "Guwahati"
      },
      {
        "airport_id": 329,
        "language_id": 1,
        "description": "Goa"
      },
      {
        "airport_id": 329,
        "language_id": 2,
        "description": "Goa"
      },
      {
        "airport_id": 330,
        "language_id": 1,
        "description": "Diu"
      },
      {
        "airport_id": 330,
        "language_id": 2,
        "description": "Diu"
      },
      {
        "airport_id": 331,
        "language_id": 1,
        "description": "Delhi"
      },
      {
        "airport_id": 331,
        "language_id": 2,
        "description": "Delhi"
      },
      {
        "airport_id": 332,
        "language_id": 1,
        "description": "Dehra Dun"
      },
      {
        "airport_id": 332,
        "language_id": 2,
        "description": "Dehra Dun"
      },
      {
        "airport_id": 333,
        "language_id": 1,
        "description": "Coimbatore"
      },
      {
        "airport_id": 333,
        "language_id": 2,
        "description": "Coimbatore"
      },
      {
        "airport_id": 334,
        "language_id": 1,
        "description": "Chennai"
      },
      {
        "airport_id": 334,
        "language_id": 2,
        "description": "Chennai"
      },
      {
        "airport_id": 335,
        "language_id": 1,
        "description": "Chandigarh"
      },
      {
        "airport_id": 335,
        "language_id": 2,
        "description": "Chandigarh"
      },
      {
        "airport_id": 336,
        "language_id": 1,
        "description": "Bhuj"
      },
      {
        "airport_id": 336,
        "language_id": 2,
        "description": "Bhuj"
      },
      {
        "airport_id": 337,
        "language_id": 1,
        "description": "Bhubaneswar"
      },
      {
        "airport_id": 337,
        "language_id": 2,
        "description": "Bhubaneswar"
      },
      {
        "airport_id": 338,
        "language_id": 1,
        "description": "Bhopal"
      },
      {
        "airport_id": 338,
        "language_id": 2,
        "description": "Bhopal"
      },
      {
        "airport_id": 339,
        "language_id": 1,
        "description": "Bangalore"
      },
      {
        "airport_id": 339,
        "language_id": 2,
        "description": "Bangalore"
      },
      {
        "airport_id": 340,
        "language_id": 1,
        "description": "Bagdogra"
      },
      {
        "airport_id": 340,
        "language_id": 2,
        "description": "Bagdogra"
      },
      {
        "airport_id": 341,
        "language_id": 1,
        "description": "Aurangabad"
      },
      {
        "airport_id": 341,
        "language_id": 2,
        "description": "Aurangabad"
      },
      {
        "airport_id": 342,
        "language_id": 1,
        "description": "Aitutaki Airport"
      },
      {
        "airport_id": 342,
        "language_id": 2,
        "description": "Aitutaki Airport"
      },
      {
        "airport_id": 343,
        "language_id": 1,
        "description": "Rarotonga Airport"
      },
      {
        "airport_id": 343,
        "language_id": 2,
        "description": "Rarotonga Airport"
      },
      {
        "airport_id": 344,
        "language_id": 1,
        "description": "Atiu Airport"
      },
      {
        "airport_id": 344,
        "language_id": 2,
        "description": "Atiu Airport"
      },
      {
        "airport_id": 345,
        "language_id": 1,
        "description": "Honolulu Airport"
      },
      {
        "airport_id": 345,
        "language_id": 2,
        "description": "Honolulu Airport"
      },
      {
        "airport_id": 346,
        "language_id": 1,
        "description": "Lihue - Kauai Airport"
      },
      {
        "airport_id": 346,
        "language_id": 2,
        "description": "Lihue - Kauai Airport"
      },
      {
        "airport_id": 347,
        "language_id": 1,
        "description": "Kahului - Maui Airport"
      },
      {
        "airport_id": 347,
        "language_id": 2,
        "description": "Kahului - Maui Airport"
      },
      {
        "airport_id": 348,
        "language_id": 1,
        "description": "Kona - Big Island Airport"
      },
      {
        "airport_id": 348,
        "language_id": 2,
        "description": "Kona - Big Island Airport"
      },
      {
        "airport_id": 349,
        "language_id": 1,
        "description": "Molokai Airport"
      },
      {
        "airport_id": 349,
        "language_id": 2,
        "description": "Molokai Airport"
      },
      {
        "airport_id": 350,
        "language_id": 1,
        "description": "Hilo - Big Island Airport"
      },
      {
        "airport_id": 350,
        "language_id": 2,
        "description": "Hilo - Big Island Airport"
      },
      {
        "airport_id": 351,
        "language_id": 1,
        "description": "Lanai Airport"
      },
      {
        "airport_id": 351,
        "language_id": 2,
        "description": "Lanai Airport"
      },
      {
        "airport_id": 353,
        "language_id": 1,
        "description": "Seoul - Incheon Airport"
      },
      {
        "airport_id": 353,
        "language_id": 2,
        "description": "Seoul - Incheon Airport"
      },
      {
        "airport_id": 354,
        "language_id": 1,
        "description": "Tanna Airport"
      },
      {
        "airport_id": 354,
        "language_id": 2,
        "description": "Tanna Airport"
      },
      {
        "airport_id": 355,
        "language_id": 1,
        "description": "Tikehau Airport"
      },
      {
        "airport_id": 355,
        "language_id": 2,
        "description": "Tikehau Airport"
      },
      {
        "airport_id": 356,
        "language_id": 1,
        "description": "Suva Airport"
      },
      {
        "airport_id": 356,
        "language_id": 2,
        "description": "Suva Airport"
      },
      {
        "airport_id": 357,
        "language_id": 1,
        "description": "Savusavu Airport"
      },
      {
        "airport_id": 357,
        "language_id": 2,
        "description": "Savusavu Airport"
      },
      {
        "airport_id": 358,
        "language_id": 1,
        "description": "Rurutu Airport"
      },
      {
        "airport_id": 358,
        "language_id": 2,
        "description": "Rurutu Airport"
      },
      {
        "airport_id": 359,
        "language_id": 1,
        "description": "Rangiroa Airport"
      },
      {
        "airport_id": 359,
        "language_id": 2,
        "description": "Rangiroa Airport"
      },
      {
        "airport_id": 360,
        "language_id": 1,
        "description": "Raivavae Airport"
      },
      {
        "airport_id": 360,
        "language_id": 2,
        "description": "Raivavae Airport"
      },
      {
        "airport_id": 361,
        "language_id": 1,
        "description": "Rairua Airport"
      },
      {
        "airport_id": 361,
        "language_id": 2,
        "description": "Rairua Airport"
      },
      {
        "airport_id": 362,
        "language_id": 1,
        "description": "Raiatea Airport"
      },
      {
        "airport_id": 362,
        "language_id": 2,
        "description": "Raiatea Airport"
      },
      {
        "airport_id": 363,
        "language_id": 1,
        "description": "Queenstown Airport"
      },
      {
        "airport_id": 363,
        "language_id": 2,
        "description": "Queenstown Airport"
      },
      {
        "airport_id": 364,
        "language_id": 1,
        "description": "Port Vila Airport"
      },
      {
        "airport_id": 364,
        "language_id": 2,
        "description": "Port Vila Airport"
      },
      {
        "airport_id": 365,
        "language_id": 1,
        "description": "Papeete Airport"
      },
      {
        "airport_id": 365,
        "language_id": 2,
        "description": "Papeete Airport"
      },
      {
        "airport_id": 366,
        "language_id": 1,
        "description": "Nuku Hiva Airport"
      },
      {
        "airport_id": 366,
        "language_id": 2,
        "description": "Nuku Hiva Airport"
      },
      {
        "airport_id": 367,
        "language_id": 1,
        "description": "Ouvea Airport"
      },
      {
        "airport_id": 367,
        "language_id": 2,
        "description": "Ouvea Airport"
      },
      {
        "airport_id": 368,
        "language_id": 1,
        "description": "Osaka - Kansai Airport"
      },
      {
        "airport_id": 368,
        "language_id": 2,
        "description": "Osaka - Kansai Airport"
      },
      {
        "airport_id": 369,
        "language_id": 1,
        "description": "Noumea Airport"
      },
      {
        "airport_id": 369,
        "language_id": 2,
        "description": "Noumea Airport"
      },
      {
        "airport_id": 370,
        "language_id": 1,
        "description": "Norsup - Malekula Airport"
      },
      {
        "airport_id": 370,
        "language_id": 2,
        "description": "Norsup - Malekula Airport"
      },
      {
        "airport_id": 371,
        "language_id": 1,
        "description": "Niue Airport"
      },
      {
        "airport_id": 371,
        "language_id": 2,
        "description": "Niue Airport"
      },
      {
        "airport_id": 372,
        "language_id": 1,
        "description": "Nelson Airport"
      },
      {
        "airport_id": 372,
        "language_id": 2,
        "description": "Nelson Airport"
      },
      {
        "airport_id": 373,
        "language_id": 1,
        "description": "Napier Airport"
      },
      {
        "airport_id": 373,
        "language_id": 2,
        "description": "Napier Airport"
      },
      {
        "airport_id": 374,
        "language_id": 1,
        "description": "Nadi Airport"
      },
      {
        "airport_id": 374,
        "language_id": 2,
        "description": "Nadi Airport"
      },
      {
        "airport_id": 375,
        "language_id": 1,
        "description": "Moorea Airport"
      },
      {
        "airport_id": 375,
        "language_id": 2,
        "description": "Moorea Airport"
      },
      {
        "airport_id": 376,
        "language_id": 1,
        "description": "Maupiti Airport"
      },
      {
        "airport_id": 376,
        "language_id": 2,
        "description": "Maupiti Airport"
      },
      {
        "airport_id": 377,
        "language_id": 1,
        "description": "Mauke Airport"
      },
      {
        "airport_id": 377,
        "language_id": 2,
        "description": "Mauke Airport"
      },
      {
        "airport_id": 378,
        "language_id": 1,
        "description": "Mataiva Airport"
      },
      {
        "airport_id": 378,
        "language_id": 2,
        "description": "Mataiva Airport"
      },
      {
        "airport_id": 379,
        "language_id": 1,
        "description": "Taveuni Airport"
      },
      {
        "airport_id": 379,
        "language_id": 2,
        "description": "Taveuni Airport"
      },
      {
        "airport_id": 380,
        "language_id": 1,
        "description": "Manihi Airport"
      },
      {
        "airport_id": 380,
        "language_id": 2,
        "description": "Manihi Airport"
      },
      {
        "airport_id": 381,
        "language_id": 1,
        "description": "Lifou Airport"
      },
      {
        "airport_id": 381,
        "language_id": 2,
        "description": "Lifou Airport"
      },
      {
        "airport_id": 382,
        "language_id": 1,
        "description": "Launceston Airport"
      },
      {
        "airport_id": 382,
        "language_id": 2,
        "description": "Launceston Airport"
      },
      {
        "airport_id": 383,
        "language_id": 1,
        "description": "Labasa Airport"
      },
      {
        "airport_id": 383,
        "language_id": 2,
        "description": "Labasa Airport"
      },
      {
        "airport_id": 384,
        "language_id": 1,
        "description": "Kone Airport"
      },
      {
        "airport_id": 384,
        "language_id": 2,
        "description": "Kone Airport"
      },
      {
        "airport_id": 385,
        "language_id": 1,
        "description": "Kadavu Airport"
      },
      {
        "airport_id": 385,
        "language_id": 2,
        "description": "Kadavu Airport"
      },
      {
        "airport_id": 386,
        "language_id": 1,
        "description": "IIe de Pines Airport"
      },
      {
        "airport_id": 386,
        "language_id": 2,
        "description": "IIe de Pines Airport"
      },
      {
        "airport_id": 387,
        "language_id": 1,
        "description": "Huahine Airport"
      },
      {
        "airport_id": 387,
        "language_id": 2,
        "description": "Huahine Airport"
      },
      {
        "airport_id": 388,
        "language_id": 1,
        "description": "Hobart Airport"
      },
      {
        "airport_id": 388,
        "language_id": 2,
        "description": "Hobart Airport"
      },
      {
        "airport_id": 389,
        "language_id": 1,
        "description": "Hiva Oa Airport"
      },
      {
        "airport_id": 389,
        "language_id": 2,
        "description": "Hiva Oa Airport"
      },
      {
        "airport_id": 390,
        "language_id": 1,
        "description": "Hervey Bay Airport"
      },
      {
        "airport_id": 390,
        "language_id": 2,
        "description": "Hervey Bay Airport"
      },
      {
        "airport_id": 391,
        "language_id": 1,
        "description": "Hamilton Airport"
      },
      {
        "airport_id": 391,
        "language_id": 2,
        "description": "Hamilton Airport"
      },
      {
        "airport_id": 392,
        "language_id": 1,
        "description": "Guam Airport"
      },
      {
        "airport_id": 392,
        "language_id": 2,
        "description": "Guam Airport"
      },
      {
        "airport_id": 393,
        "language_id": 1,
        "description": "Ha'apai Airport"
      },
      {
        "airport_id": 393,
        "language_id": 2,
        "description": "Ha'apai Airport"
      },
      {
        "airport_id": 394,
        "language_id": 1,
        "description": "Fakarava Airport"
      },
      {
        "airport_id": 394,
        "language_id": 2,
        "description": "Fakarava Airport"
      },
      {
        "airport_id": 395,
        "language_id": 1,
        "description": "Espiritu Santo Airport"
      },
      {
        "airport_id": 395,
        "language_id": 2,
        "description": "Espiritu Santo Airport"
      },
      {
        "airport_id": 396,
        "language_id": 1,
        "description": "Dunedin Airport"
      },
      {
        "airport_id": 396,
        "language_id": 2,
        "description": "Dunedin Airport"
      },
      {
        "airport_id": 397,
        "language_id": 1,
        "description": "Devonport Airport"
      },
      {
        "airport_id": 397,
        "language_id": 2,
        "description": "Devonport Airport"
      },
      {
        "airport_id": 398,
        "language_id": 1,
        "description": "Denver Airport"
      },
      {
        "airport_id": 398,
        "language_id": 2,
        "description": "Denver Airport"
      },
      {
        "airport_id": 399,
        "language_id": 1,
        "description": "Canberra Airport"
      },
      {
        "airport_id": 399,
        "language_id": 2,
        "description": "Canberra Airport"
      },
      {
        "airport_id": 400,
        "language_id": 1,
        "description": "Byron Bay Airport"
      },
      {
        "airport_id": 400,
        "language_id": 2,
        "description": "Byron Bay Airport"
      },
      {
        "airport_id": 401,
        "language_id": 1,
        "description": "Broome Airport"
      },
      {
        "airport_id": 401,
        "language_id": 2,
        "description": "Broome Airport"
      },
      {
        "airport_id": 402,
        "language_id": 1,
        "description": "Brisbane Airport"
      },
      {
        "airport_id": 402,
        "language_id": 2,
        "description": "Brisbane Airport"
      },
      {
        "airport_id": 403,
        "language_id": 1,
        "description": "Bora Bora Airport"
      },
      {
        "airport_id": 403,
        "language_id": 2,
        "description": "Bora Bora Airport"
      },
      {
        "airport_id": 404,
        "language_id": 1,
        "description": "Apia Airport"
      },
      {
        "airport_id": 404,
        "language_id": 2,
        "description": "Apia Airport"
      },
      {
        "airport_id": 405,
        "language_id": 1,
        "description": "Taupo Airport"
      },
      {
        "airport_id": 405,
        "language_id": 2,
        "description": "Taupo Airport"
      },
      {
        "airport_id": 406,
        "language_id": 1,
        "description": "Te Anau Airport"
      },
      {
        "airport_id": 406,
        "language_id": 2,
        "description": "Te Anau Airport"
      },
      {
        "airport_id": 407,
        "language_id": 1,
        "description": "Tongatapu Airport"
      },
      {
        "airport_id": 407,
        "language_id": 2,
        "description": "Tongatapu Airport"
      },
      {
        "airport_id": 408,
        "language_id": 1,
        "description": "Townsville Airport"
      },
      {
        "airport_id": 408,
        "language_id": 2,
        "description": "Townsville Airport"
      },
      {
        "airport_id": 409,
        "language_id": 1,
        "description": "Vava'u Airport"
      },
      {
        "airport_id": 409,
        "language_id": 2,
        "description": "Vava'u Airport"
      },
      {
        "airport_id": 410,
        "language_id": 1,
        "description": "Ua Po Airport"
      },
      {
        "airport_id": 410,
        "language_id": 2,
        "description": "Ua Po Airport"
      },
      {
        "airport_id": 411,
        "language_id": 1,
        "description": "Rockhampton Airport"
      },
      {
        "airport_id": 411,
        "language_id": 2,
        "description": "Rockhampton Airport"
      },
      {
        "airport_id": 412,
        "language_id": 1,
        "description": "Washington Dulles Airport"
      },
      {
        "airport_id": 412,
        "language_id": 2,
        "description": "Washington Dulles Airport"
      },
      {
        "airport_id": 413,
        "language_id": 1,
        "description": "Vancouver Airport"
      },
      {
        "airport_id": 413,
        "language_id": 2,
        "description": "Vancouver Airport"
      },
      {
        "airport_id": 414,
        "language_id": 1,
        "description": "Los Angeles Airport"
      },
      {
        "airport_id": 414,
        "language_id": 2,
        "description": "Los Angeles Airport"
      },
      {
        "airport_id": 415,
        "language_id": 1,
        "description": "Newark - New York Airport"
      },
      {
        "airport_id": 415,
        "language_id": 2,
        "description": "Newark - New York Airport"
      },
      {
        "airport_id": 416,
        "language_id": 1,
        "description": "Cocos Island Airport"
      },
      {
        "airport_id": 416,
        "language_id": 2,
        "description": "Cocos Island Airport"
      },
      {
        "airport_id": 417,
        "language_id": 1,
        "description": "Chrismas Island Airport"
      },
      {
        "airport_id": 417,
        "language_id": 2,
        "description": "Chrismas Island Airport"
      },
      {
        "airport_id": 418,
        "language_id": 1,
        "description": "Port Moresby"
      },
      {
        "airport_id": 418,
        "language_id": 2,
        "description": "Port Moresby"
      },
      {
        "airport_id": 419,
        "language_id": 1,
        "description": "Rabaul"
      },
      {
        "airport_id": 419,
        "language_id": 2,
        "description": "Rabaul"
      },
      {
        "airport_id": 420,
        "language_id": 1,
        "description": "Kavieng Airport"
      },
      {
        "airport_id": 420,
        "language_id": 2,
        "description": "Kavieng Airport"
      },
      {
        "airport_id": 421,
        "language_id": 1,
        "description": "Tufi Airport"
      },
      {
        "airport_id": 421,
        "language_id": 2,
        "description": "Tufi Airport"
      },
      {
        "airport_id": 422,
        "language_id": 1,
        "description": "Mount Hagen"
      },
      {
        "airport_id": 422,
        "language_id": 2,
        "description": "Mount Hagen"
      },
      {
        "airport_id": 423,
        "language_id": 1,
        "description": "Halifax"
      },
      {
        "airport_id": 423,
        "language_id": 2,
        "description": "Halifax"
      },
      {
        "airport_id": 424,
        "language_id": 1,
        "description": "Shanghai Hongqiao Airport"
      },
      {
        "airport_id": 424,
        "language_id": 2,
        "description": "Shanghai Hongqiao Airport"
      },
      {
        "airport_id": 425,
        "language_id": 1,
        "description": "Shanghai Pudong Airport"
      },
      {
        "airport_id": 425,
        "language_id": 2,
        "description": "Shanghai Pudong Airport"
      },
      {
        "airport_id": 426,
        "language_id": 1,
        "description": "Las Vegas"
      },
      {
        "airport_id": 426,
        "language_id": 2,
        "description": "Las Vegas"
      },
      {
        "airport_id": 427,
        "language_id": 1,
        "description": "Guangzhou Airport"
      },
      {
        "airport_id": 427,
        "language_id": 2,
        "description": "Guangzhou Airport"
      },
      {
        "airport_id": 429,
        "language_id": 1,
        "description": "Madang"
      },
      {
        "airport_id": 429,
        "language_id": 2,
        "description": "Madang"
      },
      {
        "airport_id": 430,
        "language_id": 1,
        "description": "Wewak"
      },
      {
        "airport_id": 430,
        "language_id": 2,
        "description": "Wewak"
      },
      {
        "airport_id": 431,
        "language_id": 1,
        "description": "Hoskins"
      },
      {
        "airport_id": 431,
        "language_id": 2,
        "description": "Hoskins"
      },
      {
        "airport_id": 432,
        "language_id": 1,
        "description": "Honiara Airport"
      },
      {
        "airport_id": 432,
        "language_id": 2,
        "description": "Honiara Airport"
      },
      {
        "airport_id": 433,
        "language_id": 1,
        "description": "Munda Airport"
      },
      {
        "airport_id": 433,
        "language_id": 2,
        "description": "Munda Airport"
      },
      {
        "airport_id": 434,
        "language_id": 1,
        "description": "Gizo Airport"
      },
      {
        "airport_id": 434,
        "language_id": 2,
        "description": "Gizo Airport"
      },
      {
        "airport_id": 435,
        "language_id": 1,
        "description": "Seghe Airport"
      },
      {
        "airport_id": 435,
        "language_id": 2,
        "description": "Seghe Airport"
      },
      {
        "airport_id": 436,
        "language_id": 1,
        "description": "Alotau Airport"
      },
      {
        "airport_id": 436,
        "language_id": 2,
        "description": "Alotau Airport"
      },
      {
        "airport_id": 437,
        "language_id": 1,
        "description": "Majuro"
      },
      {
        "airport_id": 437,
        "language_id": 2,
        "description": "Majuro"
      },
      {
        "airport_id": 438,
        "language_id": 1,
        "description": "Proserpine"
      },
      {
        "airport_id": 438,
        "language_id": 2,
        "description": "Proserpine"
      },
      {
        "airport_id": 439,
        "language_id": 1,
        "description": "Blantyre Airport"
      },
      {
        "airport_id": 439,
        "language_id": 2,
        "description": "Blantyre Airport"
      },
      {
        "airport_id": 440,
        "language_id": 1,
        "description": "Inhambane Airport"
      },
      {
        "airport_id": 440,
        "language_id": 2,
        "description": "Inhambane Airport"
      },
      {
        "airport_id": 441,
        "language_id": 1,
        "description": "Port Hedland"
      },
      {
        "airport_id": 441,
        "language_id": 2,
        "description": "Port Hedland"
      },
      {
        "airport_id": 442,
        "language_id": 1,
        "description": "Koror"
      },
      {
        "airport_id": 442,
        "language_id": 2,
        "description": "Koror"
      },
      {
        "airport_id": 443,
        "language_id": 1,
        "description": "Bogota el Dorado Airport"
      },
      {
        "airport_id": 443,
        "language_id": 2,
        "description": "Bogota el Dorado Airport"
      },
      {
        "airport_id": 444,
        "language_id": 1,
        "description": "Kalgoorlie"
      },
      {
        "airport_id": 444,
        "language_id": 2,
        "description": "Kalgoorlie"
      },
      {
        "airport_id": 445,
        "language_id": 1,
        "description": "Coolangatta Gold Coast Airport"
      },
      {
        "airport_id": 445,
        "language_id": 2,
        "description": "Coolangatta Gold Coast Airport"
      },
      {
        "airport_id": 446,
        "language_id": 1,
        "description": "Anchorage"
      },
      {
        "airport_id": 446,
        "language_id": 2,
        "description": "Anchorage"
      },
      {
        "airport_id": 447,
        "language_id": 1,
        "description": "Fukuoka"
      },
      {
        "airport_id": 447,
        "language_id": 2,
        "description": "Fukuoka"
      },
      {
        "airport_id": 448,
        "language_id": 1,
        "description": "Antananarivo"
      },
      {
        "airport_id": 448,
        "language_id": 2,
        "description": "Antananarivo"
      },
      {
        "airport_id": 449,
        "language_id": 1,
        "description": "Diego Suarez"
      },
      {
        "airport_id": 449,
        "language_id": 2,
        "description": "Diego Suarez"
      },
      {
        "airport_id": 450,
        "language_id": 1,
        "description": "Nosy Be"
      },
      {
        "airport_id": 450,
        "language_id": 2,
        "description": "Nosy Be"
      },
      {
        "airport_id": 451,
        "language_id": 1,
        "description": "Sainte Marie"
      },
      {
        "airport_id": 451,
        "language_id": 2,
        "description": "Sainte Marie"
      }
    ];

    
    airports = [
      {
        "id": 1,
        "iata_code": "AMS"
      },
      {
        "id": 2,
        "iata_code": "CPT"
      },
      {
        "id": 3,
        "iata_code": "BRU"
      },
      {
        "id": 4,
        "iata_code": "EZE"
      },
      {
        "id": 5,
        "iata_code": "AUH"
      },
      {
        "id": 6,
        "iata_code": "ANU"
      },
      {
        "id": 7,
        "iata_code": "BBQ"
      },
      {
        "id": 8,
        "iata_code": "BRC"
      },
      {
        "id": 9,
        "iata_code": "AEP"
      },
      {
        "id": 10,
        "iata_code": "FTE"
      },
      {
        "id": 11,
        "iata_code": "COR"
      },
      {
        "id": 12,
        "iata_code": "CNQ"
      },
      {
        "id": 13,
        "iata_code": "FMA"
      },
      {
        "id": 14,
        "iata_code": "IRJ"
      },
      {
        "id": 15,
        "iata_code": "MDQ"
      },
      {
        "id": 16,
        "iata_code": "MDZ"
      },
      {
        "id": 17,
        "iata_code": "PSS"
      },
      {
        "id": 18,
        "iata_code": "IGR"
      },
      {
        "id": 19,
        "iata_code": "RGL"
      },
      {
        "id": 20,
        "iata_code": "SLA"
      },
      {
        "id": 21,
        "iata_code": "UAQ"
      },
      {
        "id": 22,
        "iata_code": "REL"
      },
      {
        "id": 23,
        "iata_code": "TUC"
      },
      {
        "id": 24,
        "iata_code": "USH"
      },
      {
        "id": 25,
        "iata_code": "ADL"
      },
      {
        "id": 26,
        "iata_code": "ASP"
      },
      {
        "id": 27,
        "iata_code": "AYQ"
      },
      {
        "id": 28,
        "iata_code": "CNS"
      },
      {
        "id": 29,
        "iata_code": "DRW"
      },
      {
        "id": 30,
        "iata_code": "MEL"
      },
      {
        "id": 31,
        "iata_code": "PER"
      },
      {
        "id": 32,
        "iata_code": "SYD"
      },
      {
        "id": 33,
        "iata_code": "NAS"
      },
      {
        "id": 34,
        "iata_code": "BAH"
      },
      {
        "id": 35,
        "iata_code": "BGI"
      },
      {
        "id": 36,
        "iata_code": "ZYR"
      },
      {
        "id": 37,
        "iata_code": "ZWE"
      },
      {
        "id": 38,
        "iata_code": "BZE"
      },
      {
        "id": 39,
        "iata_code": "SPR"
      },
      {
        "id": 40,
        "iata_code": "PBH"
      },
      {
        "id": 41,
        "iata_code": "LPB"
      },
      {
        "id": 42,
        "iata_code": "GBE"
      },
      {
        "id": 43,
        "iata_code": "BBK"
      },
      {
        "id": 44,
        "iata_code": "MUB"
      },
      {
        "id": 45,
        "iata_code": "AIR"
      },
      {
        "id": 46,
        "iata_code": "AFL"
      },
      {
        "id": 47,
        "iata_code": "BHZ"
      },
      {
        "id": 48,
        "iata_code": "BSB"
      },
      {
        "id": 49,
        "iata_code": "CGR"
      },
      {
        "id": 50,
        "iata_code": "CGB"
      },
      {
        "id": 51,
        "iata_code": "FEN"
      },
      {
        "id": 52,
        "iata_code": "FLN"
      },
      {
        "id": 53,
        "iata_code": "IGU"
      },
      {
        "id": 54,
        "iata_code": "IOS"
      },
      {
        "id": 55,
        "iata_code": "MAO"
      },
      {
        "id": 56,
        "iata_code": "NAT"
      },
      {
        "id": 57,
        "iata_code": "BPS"
      },
      {
        "id": 58,
        "iata_code": "REC"
      },
      {
        "id": 59,
        "iata_code": "GIG"
      },
      {
        "id": 60,
        "iata_code": "SSA"
      },
      {
        "id": 61,
        "iata_code": "SLZ"
      },
      {
        "id": 62,
        "iata_code": "GRU"
      },
      {
        "id": 63,
        "iata_code": "CGH"
      },
      {
        "id": 64,
        "iata_code": "TFF"
      },
      {
        "id": 65,
        "iata_code": "PNH"
      },
      {
        "id": 66,
        "iata_code": "REP"
      },
      {
        "id": 67,
        "iata_code": "YYT"
      },
      {
        "id": 68,
        "iata_code": "YYZ"
      },
      {
        "id": 69,
        "iata_code": "YWG"
      },
      {
        "id": 70,
        "iata_code": "CIW"
      },
      {
        "id": 71,
        "iata_code": "BGF"
      },
      {
        "id": 72,
        "iata_code": "ANF"
      },
      {
        "id": 73,
        "iata_code": "ARI"
      },
      {
        "id": 74,
        "iata_code": "BBA"
      },
      {
        "id": 75,
        "iata_code": "CJC"
      },
      {
        "id": 76,
        "iata_code": "IPC"
      },
      {
        "id": 77,
        "iata_code": "IQQ"
      },
      {
        "id": 78,
        "iata_code": "LSC"
      },
      {
        "id": 79,
        "iata_code": "PMC"
      },
      {
        "id": 80,
        "iata_code": "PUQ"
      },
      {
        "id": 81,
        "iata_code": "SCL"
      },
      {
        "id": 82,
        "iata_code": "ZCO"
      },
      {
        "id": 83,
        "iata_code": "PEK"
      },
      {
        "id": 84,
        "iata_code": "CTU"
      },
      {
        "id": 85,
        "iata_code": "LIR"
      },
      {
        "id": 86,
        "iata_code": "PMZ"
      },
      {
        "id": 87,
        "iata_code": "XQP"
      },
      {
        "id": 88,
        "iata_code": "SJO"
      },
      {
        "id": 89,
        "iata_code": "TMU"
      },
      {
        "id": 90,
        "iata_code": "TTQ"
      },
      {
        "id": 91,
        "iata_code": "HAV"
      },
      {
        "id": 92,
        "iata_code": "VRA"
      },
      {
        "id": 93,
        "iata_code": "PFO"
      },
      {
        "id": 94,
        "iata_code": "CPH"
      },
      {
        "id": 95,
        "iata_code": "DXB"
      },
      {
        "id": 96,
        "iata_code": "DUS"
      },
      {
        "id": 97,
        "iata_code": "FRA"
      },
      {
        "id": 98,
        "iata_code": "HAM"
      },
      {
        "id": 99,
        "iata_code": "MUC"
      },
      {
        "id": 100,
        "iata_code": "NRN"
      },
      {
        "id": 101,
        "iata_code": "OCC"
      },
      {
        "id": 102,
        "iata_code": "CUE"
      },
      {
        "id": 103,
        "iata_code": "GYE"
      },
      {
        "id": 104,
        "iata_code": "MEC"
      },
      {
        "id": 105,
        "iata_code": "UIO"
      },
      {
        "id": 106,
        "iata_code": "CAI"
      },
      {
        "id": 107,
        "iata_code": "HRG"
      },
      {
        "id": 108,
        "iata_code": "LXR"
      },
      {
        "id": 109,
        "iata_code": "ADD"
      },
      {
        "id": 110,
        "iata_code": "MPN"
      },
      {
        "id": 111,
        "iata_code": "PSY"
      },
      {
        "id": 112,
        "iata_code": "MNL"
      },
      {
        "id": 113,
        "iata_code": "HEL"
      },
      {
        "id": 114,
        "iata_code": "KAJ"
      },
      {
        "id": 115,
        "iata_code": "OUL"
      },
      {
        "id": 116,
        "iata_code": "NCE"
      },
      {
        "id": 117,
        "iata_code": "CDG"
      },
      {
        "id": 118,
        "iata_code": "ORY"
      },
      {
        "id": 119,
        "iata_code": "GPS"
      },
      {
        "id": 120,
        "iata_code": "SCY"
      },
      {
        "id": 121,
        "iata_code": "ATH"
      },
      {
        "id": 122,
        "iata_code": "HKL"
      },
      {
        "id": 123,
        "iata_code": "LGW"
      },
      {
        "id": 124,
        "iata_code": "LHR"
      },
      {
        "id": 125,
        "iata_code": "FRS"
      },
      {
        "id": 126,
        "iata_code": "GUA"
      },
      {
        "id": 127,
        "iata_code": "GEO"
      },
      {
        "id": 128,
        "iata_code": "BUD"
      },
      {
        "id": 129,
        "iata_code": "HKG"
      },
      {
        "id": 130,
        "iata_code": "DUB"
      },
      {
        "id": 131,
        "iata_code": "AEY"
      },
      {
        "id": 132,
        "iata_code": "KEF"
      },
      {
        "id": 133,
        "iata_code": "RKV"
      },
      {
        "id": 134,
        "iata_code": "AGX"
      },
      {
        "id": 135,
        "iata_code": "AGR"
      },
      {
        "id": 136,
        "iata_code": "AMD"
      },
      {
        "id": 137,
        "iata_code": "IXD"
      },
      {
        "id": 138,
        "iata_code": "ATQ"
      },
      {
        "id": 139,
        "iata_code": "GVA"
      },
      {
        "id": 140,
        "iata_code": "ZRH"
      },
      {
        "id": 141,
        "iata_code": "GOT"
      },
      {
        "id": 142,
        "iata_code": "DUR"
      },
      {
        "id": 143,
        "iata_code": "ELS"
      },
      {
        "id": 144,
        "iata_code": "GRJ"
      },
      {
        "id": 145,
        "iata_code": "HDS"
      },
      {
        "id": 146,
        "iata_code": "MQP"
      },
      {
        "id": 147,
        "iata_code": "JNB"
      },
      {
        "id": 148,
        "iata_code": "PHW"
      },
      {
        "id": 149,
        "iata_code": "PTG"
      },
      {
        "id": 150,
        "iata_code": "PLZ"
      },
      {
        "id": 151,
        "iata_code": "RCB"
      },
      {
        "id": 152,
        "iata_code": "SZK"
      },
      {
        "id": 153,
        "iata_code": "UTT"
      },
      {
        "id": 154,
        "iata_code": "UTN"
      },
      {
        "id": 155,
        "iata_code": "HRE"
      },
      {
        "id": 156,
        "iata_code": "VFA"
      },
      {
        "id": 157,
        "iata_code": "LVI"
      },
      {
        "id": 158,
        "iata_code": "LUN"
      },
      {
        "id": 159,
        "iata_code": "MFU"
      },
      {
        "id": 160,
        "iata_code": "HAN"
      },
      {
        "id": 161,
        "iata_code": "SGN"
      },
      {
        "id": 162,
        "iata_code": "NHA"
      },
      {
        "id": 163,
        "iata_code": "MVD"
      },
      {
        "id": 164,
        "iata_code": "PDP"
      },
      {
        "id": 165,
        "iata_code": "ATL"
      },
      {
        "id": 166,
        "iata_code": "BZN"
      },
      {
        "id": 167,
        "iata_code": "IAH"
      },
      {
        "id": 168,
        "iata_code": "JAC"
      },
      {
        "id": 169,
        "iata_code": "JNU"
      },
      {
        "id": 170,
        "iata_code": "MIA"
      },
      {
        "id": 171,
        "iata_code": "MSP"
      },
      {
        "id": 172,
        "iata_code": "JFK"
      },
      {
        "id": 173,
        "iata_code": "ORD"
      },
      {
        "id": 174,
        "iata_code": "MCO"
      },
      {
        "id": 175,
        "iata_code": "SLC"
      },
      {
        "id": 176,
        "iata_code": "SFO"
      },
      {
        "id": 177,
        "iata_code": "SEA"
      },
      {
        "id": 178,
        "iata_code": "SIT"
      },
      {
        "id": 179,
        "iata_code": "PLS"
      },
      {
        "id": 180,
        "iata_code": "AYT"
      },
      {
        "id": 181,
        "iata_code": "BJV"
      },
      {
        "id": 182,
        "iata_code": "IST"
      },
      {
        "id": 183,
        "iata_code": "DMK"
      },
      {
        "id": 184,
        "iata_code": "BKK"
      },
      {
        "id": 185,
        "iata_code": "CNX"
      },
      {
        "id": 186,
        "iata_code": "CEI"
      },
      {
        "id": 187,
        "iata_code": "USM"
      },
      {
        "id": 188,
        "iata_code": "HKT"
      },
      {
        "id": 189,
        "iata_code": "ARK"
      },
      {
        "id": 190,
        "iata_code": "DAR"
      },
      {
        "id": 191,
        "iata_code": "JRO"
      },
      {
        "id": 192,
        "iata_code": "LKY"
      },
      {
        "id": 193,
        "iata_code": "SEU"
      },
      {
        "id": 194,
        "iata_code": "ZNZ"
      },
      {
        "id": 195,
        "iata_code": "TPE"
      },
      {
        "id": 196,
        "iata_code": "PBM"
      },
      {
        "id": 197,
        "iata_code": "SLU"
      },
      {
        "id": 198,
        "iata_code": "SBH"
      },
      {
        "id": 199,
        "iata_code": "CMB"
      },
      {
        "id": 200,
        "iata_code": "LYR"
      },
      {
        "id": 201,
        "iata_code": "BCN"
      },
      {
        "id": 202,
        "iata_code": "MAD"
      },
      {
        "id": 203,
        "iata_code": "AGP"
      },
      {
        "id": 204,
        "iata_code": "PMI"
      },
      {
        "id": 205,
        "iata_code": "TFS"
      },
      {
        "id": 206,
        "iata_code": "SIN"
      },
      {
        "id": 207,
        "iata_code": "PRL"
      },
      {
        "id": 208,
        "iata_code": "SEZ"
      },
      {
        "id": 209,
        "iata_code": "KGL"
      },
      {
        "id": 210,
        "iata_code": "DYR"
      },
      {
        "id": 211,
        "iata_code": "MMK"
      },
      {
        "id": 212,
        "iata_code": "SVO"
      },
      {
        "id": 213,
        "iata_code": "PKC"
      },
      {
        "id": 214,
        "iata_code": "LED"
      },
      {
        "id": 215,
        "iata_code": "RRG"
      },
      {
        "id": 216,
        "iata_code": "DOH"
      },
      {
        "id": 217,
        "iata_code": "FAO"
      },
      {
        "id": 218,
        "iata_code": "HOR"
      },
      {
        "id": 219,
        "iata_code": "LIS"
      },
      {
        "id": 220,
        "iata_code": "AQP"
      },
      {
        "id": 221,
        "iata_code": "CJA"
      },
      {
        "id": 222,
        "iata_code": "CIX"
      },
      {
        "id": 223,
        "iata_code": "CUZ"
      },
      {
        "id": 224,
        "iata_code": "IQT"
      },
      {
        "id": 225,
        "iata_code": "JUL"
      },
      {
        "id": 226,
        "iata_code": "LIM"
      },
      {
        "id": 227,
        "iata_code": "PEM"
      },
      {
        "id": 228,
        "iata_code": "TPP"
      },
      {
        "id": 229,
        "iata_code": "TRU"
      },
      {
        "id": 230,
        "iata_code": "ASU"
      },
      {
        "id": 231,
        "iata_code": "BOC"
      },
      {
        "id": 232,
        "iata_code": "DAV"
      },
      {
        "id": 233,
        "iata_code": "PTY"
      },
      {
        "id": 234,
        "iata_code": "PAC"
      },
      {
        "id": 235,
        "iata_code": "NBL"
      },
      {
        "id": 236,
        "iata_code": "INN"
      },
      {
        "id": 237,
        "iata_code": "VIE"
      },
      {
        "id": 238,
        "iata_code": "MCT"
      },
      {
        "id": 239,
        "iata_code": "IEV"
      },
      {
        "id": 240,
        "iata_code": "KBP"
      },
      {
        "id": 241,
        "iata_code": "EBB"
      },
      {
        "id": 242,
        "iata_code": "BGO"
      },
      {
        "id": 243,
        "iata_code": "OSL"
      },
      {
        "id": 244,
        "iata_code": "TOS"
      },
      {
        "id": 245,
        "iata_code": "AKL"
      },
      {
        "id": 246,
        "iata_code": "CHC"
      },
      {
        "id": 247,
        "iata_code": "WLG"
      },
      {
        "id": 248,
        "iata_code": "KTM"
      },
      {
        "id": 249,
        "iata_code": "MEY"
      },
      {
        "id": 250,
        "iata_code": "AUA"
      },
      {
        "id": 251,
        "iata_code": "BON"
      },
      {
        "id": 252,
        "iata_code": "CUR"
      },
      {
        "id": 253,
        "iata_code": "SXM"
      },
      {
        "id": 254,
        "iata_code": "EIN"
      },
      {
        "id": 255,
        "iata_code": "MST"
      },
      {
        "id": 256,
        "iata_code": "RTM"
      },
      {
        "id": 257,
        "iata_code": "WDH"
      },
      {
        "id": 258,
        "iata_code": "MQS"
      },
      {
        "id": 259,
        "iata_code": "MPM"
      },
      {
        "id": 260,
        "iata_code": "POL"
      },
      {
        "id": 261,
        "iata_code": "VNX"
      },
      {
        "id": 262,
        "iata_code": "ACA"
      },
      {
        "id": 263,
        "iata_code": "CUN"
      },
      {
        "id": 264,
        "iata_code": "CUU"
      },
      {
        "id": 265,
        "iata_code": "GDL"
      },
      {
        "id": 266,
        "iata_code": "ZIH"
      },
      {
        "id": 267,
        "iata_code": "LAP"
      },
      {
        "id": 268,
        "iata_code": "BJX"
      },
      {
        "id": 269,
        "iata_code": "LMM"
      },
      {
        "id": 270,
        "iata_code": "MEX"
      },
      {
        "id": 271,
        "iata_code": "MID"
      },
      {
        "id": 272,
        "iata_code": "OAX"
      },
      {
        "id": 273,
        "iata_code": "PVR"
      },
      {
        "id": 274,
        "iata_code": "SAN"
      },
      {
        "id": 275,
        "iata_code": "SJD"
      },
      {
        "id": 276,
        "iata_code": "TIJ"
      },
      {
        "id": 277,
        "iata_code": "TGZ"
      },
      {
        "id": 278,
        "iata_code": "VSA"
      },
      {
        "id": 279,
        "iata_code": "MRU"
      },
      {
        "id": 280,
        "iata_code": "CMN"
      },
      {
        "id": 281,
        "iata_code": "RAK"
      },
      {
        "id": 282,
        "iata_code": "KUL"
      },
      {
        "id": 283,
        "iata_code": "MLE"
      },
      {
        "id": 284,
        "iata_code": "LLW"
      },
      {
        "id": 285,
        "iata_code": "TIP"
      },
      {
        "id": 286,
        "iata_code": "RUN"
      },
      {
        "id": 287,
        "iata_code": "ASV"
      },
      {
        "id": 288,
        "iata_code": "NBO"
      },
      {
        "id": 289,
        "iata_code": "KIS"
      },
      {
        "id": 290,
        "iata_code": "LAU"
      },
      {
        "id": 291,
        "iata_code": "MYD"
      },
      {
        "id": 292,
        "iata_code": "MBA"
      },
      {
        "id": 293,
        "iata_code": "NYK"
      },
      {
        "id": 294,
        "iata_code": "UAS"
      },
      {
        "id": 295,
        "iata_code": "WIL"
      },
      {
        "id": 296,
        "iata_code": "AMM"
      },
      {
        "id": 297,
        "iata_code": "TAK"
      },
      {
        "id": 298,
        "iata_code": "HND"
      },
      {
        "id": 299,
        "iata_code": "NRT"
      },
      {
        "id": 300,
        "iata_code": "BRI"
      },
      {
        "id": 301,
        "iata_code": "MXP"
      },
      {
        "id": 302,
        "iata_code": "LIN"
      },
      {
        "id": 303,
        "iata_code": "FCO"
      },
      {
        "id": 304,
        "iata_code": "DPS"
      },
      {
        "id": 305,
        "iata_code": "JKT"
      },
      {
        "id": 306,
        "iata_code": "VNS"
      },
      {
        "id": 307,
        "iata_code": "UDR"
      },
      {
        "id": 308,
        "iata_code": "TRV"
      },
      {
        "id": 309,
        "iata_code": "SLV"
      },
      {
        "id": 310,
        "iata_code": "RPR"
      },
      {
        "id": 311,
        "iata_code": "IXZ"
      },
      {
        "id": 312,
        "iata_code": "NAG"
      },
      {
        "id": 313,
        "iata_code": "MYQ"
      },
      {
        "id": 314,
        "iata_code": "BOM"
      },
      {
        "id": 315,
        "iata_code": "IXE"
      },
      {
        "id": 316,
        "iata_code": "IXM"
      },
      {
        "id": 317,
        "iata_code": "IXL"
      },
      {
        "id": 318,
        "iata_code": "CCJ"
      },
      {
        "id": 319,
        "iata_code": "CCU"
      },
      {
        "id": 320,
        "iata_code": "COK"
      },
      {
        "id": 321,
        "iata_code": "HJR"
      },
      {
        "id": 322,
        "iata_code": "JRH"
      },
      {
        "id": 323,
        "iata_code": "JDH"
      },
      {
        "id": 324,
        "iata_code": "JAI"
      },
      {
        "id": 325,
        "iata_code": "JRL"
      },
      {
        "id": 326,
        "iata_code": "HYD"
      },
      {
        "id": 327,
        "iata_code": "GWL"
      },
      {
        "id": 328,
        "iata_code": "GAU"
      },
      {
        "id": 329,
        "iata_code": "GOI"
      },
      {
        "id": 330,
        "iata_code": "DIU"
      },
      {
        "id": 331,
        "iata_code": "DEL"
      },
      {
        "id": 332,
        "iata_code": "DED"
      },
      {
        "id": 333,
        "iata_code": "CJB"
      },
      {
        "id": 334,
        "iata_code": "MAA"
      },
      {
        "id": 335,
        "iata_code": "IXC"
      },
      {
        "id": 336,
        "iata_code": "BHJ"
      },
      {
        "id": 337,
        "iata_code": "BBI"
      },
      {
        "id": 338,
        "iata_code": "BHO"
      },
      {
        "id": 339,
        "iata_code": "BLR"
      },
      {
        "id": 340,
        "iata_code": "IXB"
      },
      {
        "id": 341,
        "iata_code": "IXU"
      },
      {
        "id": 342,
        "iata_code": "AIT"
      },
      {
        "id": 343,
        "iata_code": "RAR"
      },
      {
        "id": 344,
        "iata_code": "AIU"
      },
      {
        "id": 345,
        "iata_code": "HNL"
      },
      {
        "id": 346,
        "iata_code": "LIH"
      },
      {
        "id": 347,
        "iata_code": "OGG"
      },
      {
        "id": 348,
        "iata_code": "KOA"
      },
      {
        "id": 349,
        "iata_code": "MKK"
      },
      {
        "id": 350,
        "iata_code": "ITO"
      },
      {
        "id": 351,
        "iata_code": "LNY"
      },
      {
        "id": 352,
        "iata_code": "SEL"
      },
      {
        "id": 353,
        "iata_code": "ICN"
      },
      {
        "id": 354,
        "iata_code": "TAH"
      },
      {
        "id": 355,
        "iata_code": "TIH"
      },
      {
        "id": 356,
        "iata_code": "SUV"
      },
      {
        "id": 357,
        "iata_code": "SVU"
      },
      {
        "id": 358,
        "iata_code": "RUR"
      },
      {
        "id": 359,
        "iata_code": "RGI"
      },
      {
        "id": 360,
        "iata_code": "RVV"
      },
      {
        "id": 361,
        "iata_code": "RMT"
      },
      {
        "id": 362,
        "iata_code": "RFP"
      },
      {
        "id": 363,
        "iata_code": "ZQN"
      },
      {
        "id": 364,
        "iata_code": "VLI"
      },
      {
        "id": 365,
        "iata_code": "PPT"
      },
      {
        "id": 366,
        "iata_code": "NHV"
      },
      {
        "id": 367,
        "iata_code": "UVE"
      },
      {
        "id": 368,
        "iata_code": "KIX"
      },
      {
        "id": 369,
        "iata_code": "NOU"
      },
      {
        "id": 370,
        "iata_code": "NUS"
      },
      {
        "id": 371,
        "iata_code": "IUE"
      },
      {
        "id": 372,
        "iata_code": "NSN"
      },
      {
        "id": 373,
        "iata_code": "NPE"
      },
      {
        "id": 374,
        "iata_code": "NAN"
      },
      {
        "id": 375,
        "iata_code": "MOZ"
      },
      {
        "id": 376,
        "iata_code": "MAU"
      },
      {
        "id": 377,
        "iata_code": "MUK"
      },
      {
        "id": 378,
        "iata_code": "MVT"
      },
      {
        "id": 379,
        "iata_code": "TVU"
      },
      {
        "id": 380,
        "iata_code": "XMH"
      },
      {
        "id": 381,
        "iata_code": "LIF"
      },
      {
        "id": 382,
        "iata_code": "LST"
      },
      {
        "id": 383,
        "iata_code": "LBS"
      },
      {
        "id": 384,
        "iata_code": "KNQ"
      },
      {
        "id": 385,
        "iata_code": "KDV"
      },
      {
        "id": 386,
        "iata_code": "ILP"
      },
      {
        "id": 387,
        "iata_code": "HUH"
      },
      {
        "id": 388,
        "iata_code": "HBA"
      },
      {
        "id": 389,
        "iata_code": "AUQ"
      },
      {
        "id": 390,
        "iata_code": "HVB"
      },
      {
        "id": 391,
        "iata_code": "HTI"
      },
      {
        "id": 392,
        "iata_code": "GUM"
      },
      {
        "id": 393,
        "iata_code": "HPA"
      },
      {
        "id": 394,
        "iata_code": "FAV"
      },
      {
        "id": 395,
        "iata_code": "SON"
      },
      {
        "id": 396,
        "iata_code": "DUD"
      },
      {
        "id": 397,
        "iata_code": "DPO"
      },
      {
        "id": 398,
        "iata_code": "DEN"
      },
      {
        "id": 399,
        "iata_code": "CBR"
      },
      {
        "id": 400,
        "iata_code": "BNK"
      },
      {
        "id": 401,
        "iata_code": "BME"
      },
      {
        "id": 402,
        "iata_code": "BNE"
      },
      {
        "id": 403,
        "iata_code": "BOB"
      },
      {
        "id": 404,
        "iata_code": "APW"
      },
      {
        "id": 405,
        "iata_code": "TUO"
      },
      {
        "id": 406,
        "iata_code": "TEU"
      },
      {
        "id": 407,
        "iata_code": "TBU"
      },
      {
        "id": 408,
        "iata_code": "TSV"
      },
      {
        "id": 409,
        "iata_code": "VAV"
      },
      {
        "id": 410,
        "iata_code": "UAP"
      },
      {
        "id": 411,
        "iata_code": "ROK"
      },
      {
        "id": 412,
        "iata_code": "IAD"
      },
      {
        "id": 413,
        "iata_code": "YVR"
      },
      {
        "id": 414,
        "iata_code": "LAX"
      },
      {
        "id": 415,
        "iata_code": "EWR"
      },
      {
        "id": 416,
        "iata_code": "CCK"
      },
      {
        "id": 417,
        "iata_code": "XCH"
      },
      {
        "id": 418,
        "iata_code": "POM"
      },
      {
        "id": 419,
        "iata_code": "RAB"
      },
      {
        "id": 420,
        "iata_code": "KVG"
      },
      {
        "id": 421,
        "iata_code": "TFI"
      },
      {
        "id": 422,
        "iata_code": "HGU"
      },
      {
        "id": 423,
        "iata_code": "YHZ"
      },
      {
        "id": 424,
        "iata_code": "SHA"
      },
      {
        "id": 425,
        "iata_code": "PVG"
      },
      {
        "id": 426,
        "iata_code": "LAS"
      },
      {
        "id": 427,
        "iata_code": "CAN"
      },
      {
        "id": 428,
        "iata_code": "ODR"
      },
      {
        "id": 429,
        "iata_code": "MAG"
      },
      {
        "id": 430,
        "iata_code": "WWK"
      },
      {
        "id": 431,
        "iata_code": "HKN"
      },
      {
        "id": 432,
        "iata_code": "HIR"
      },
      {
        "id": 433,
        "iata_code": "MUA"
      },
      {
        "id": 434,
        "iata_code": "GZO"
      },
      {
        "id": 435,
        "iata_code": "EGM"
      },
      {
        "id": 436,
        "iata_code": "GUR"
      },
      {
        "id": 437,
        "iata_code": "MAJ"
      },
      {
        "id": 438,
        "iata_code": "PPP"
      },
      {
        "id": 439,
        "iata_code": "BLZ"
      },
      {
        "id": 440,
        "iata_code": "INH"
      },
      {
        "id": 441,
        "iata_code": "PHE"
      },
      {
        "id": 442,
        "iata_code": "ROR"
      },
      {
        "id": 443,
        "iata_code": "BOG"
      },
      {
        "id": 444,
        "iata_code": "KGI"
      },
      {
        "id": 445,
        "iata_code": "OOL"
      },
      {
        "id": 446,
        "iata_code": "ANC"
      },
      {
        "id": 447,
        "iata_code": "FUK"
      },
      {
        "id": 448,
        "iata_code": "TNR"
      },
      {
        "id": 449,
        "iata_code": "DIE"
      },
      {
        "id": 450,
        "iata_code": "NOS"
      },
      {
        "id": 451,
        "iata_code": "SMS"
      }
    ];

    var getObjectByValue = function (array, key, value) {
      return array.filter(function (object) {
          return object[key] === value;
      });
    };

    months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'];
    flights = [];
    
    var firstLoopExectuion = false;
    for(const segment of obj.dst.segments) {
      
      for(const flight of segment.flightInfo) {
        
        let departureInfo = getObjectByValue(airports, 'iata_code', flight.departureAirport);
        let arrivalInfo = getObjectByValue(airports, 'iata_code', flight.arrivalAirport);
        
        if(departureInfo[0] !== undefined && arrivalInfo[0] !== undefined) {

          let departureAirport = getObjectByValue(airportDescriptions, 'airport_id', departureInfo[0].id);
          let arrivalAirport = getObjectByValue(airportDescriptions, 'airport_id', arrivalInfo[0].id);
          if(departureAirport[0] !== undefined && arrivalAirport[0] !== undefined) {
            
            var date = new Date(flight.departureDate);
            var arrivalDate = new Date(flight.arrivalDate);
            if(!firstLoopExectuion) {

              let airlineCode = getObjectByValue(airlineCodes, 'carrier_code', flight.airlineCode);
              airlineCode = airlineCode[0] !== undefined?airlineCode[0].airline:null;

              obj.dst.departureFlight = {date: date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear(), airlineCode: airlineCode};
              firstLoopExectuion = true;
            }
            let airlineCode = getObjectByValue(airlineCodes, 'carrier_code', flight.airlineCode);
            airlineCode = airlineCode[0] !== undefined?airlineCode[0].airline:null;

            var arrivalFlightDate = new Date(flight.arrivalDate);
            obj.dst.arrivalFlight = {date: arrivalFlightDate.getDate() + ' ' + months[arrivalFlightDate.getMonth()] + ' ' + arrivalFlightDate.getFullYear(), airlineCode: airlineCode};
            var dateString = date.getDate() + '-' + months[date.getMonth()];
            var arrivalDateString = arrivalDate.getDate() + '-' + months[arrivalDate.getMonth()];

            let data = {date: dateString, arrivalDate: arrivalDateString, departureAirport: departureAirport[0].description, arrivalAirport: arrivalAirport[0].description, departureTime: flight.departureTime, arrivalTime: flight.arrivalTime, flightNumber: flight.flightNumber, airlineCode: airlineCode};
            flights.push(data);

          }

        }

      }

    }
    
    obj.dst.flights = flights;
    
    return obj;
  }
};

module.exports = customTransforms;
