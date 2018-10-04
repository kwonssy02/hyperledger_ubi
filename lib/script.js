/**
 * 차량 데이터 등록 트랜잭션
 * @param {com.autoever.ubi.transaction.insertVehicleData} vehicleData
 * @transaction
 * 
 */
async function insertVehicleData(vehicleData) {
    var occuredDate = generateDate();
    
    const vehicleRegistry = await getAssetRegistry('com.autoever.ubi.asset.Vehicle');
    const vehicle = await vehicleRegistry.get(vehicleData.vehicleId);
    if(!vehicle) throw new Error("Vehicle : " + vehicleData.vehicleId, " Not Found!!!");

    const vehicleDataRegistry = await getAssetRegistry('com.autoever.ubi.asset.VehicleData');
    
    var factory = getFactory();

    var newVehicleData = factory.newResource('com.autoever.ubi.asset', 'VehicleData', 'VDI:' + occuredDate);
    var vehicleRelation = factory.newRelationship('com.autoever.ubi.asset', 'Vehicle', vehicleData.vehicleId);
    // newVehicleData.occuredDate = occuredDate;
    newVehicleData.occuredDate = new Date();
    newVehicleData.vehicle = vehicleRelation;
    newVehicleData.speed = vehicleData.speed;
    newVehicleData.angle = vehicleData.angle;
    
    // 4. Add to registry
    await vehicleDataRegistry.add(newVehicleData);


    // throw new Error("insertVehicleData " + vehicleData.occuredDate + " " + vehicleData.speed + " " + vehicleData.angle + "개발 예정");
}


/**
 * 보험사 정보 제공 동의
 * @param {com.autoever.ubi.transaction.updateDataProvidingAgreement} agreementData
 * @transaction
 * 
 */
async function updateDataProvidingAgreement(agreementData) {


    const vehicleRegistry = await getAssetRegistry('com.autoever.ubi.asset.Vehicle');
    const vehicle = await vehicleRegistry.get(agreementData.vehicleId);
    
    if(!vehicle) throw new Error("Vehicle : " + agreementData.vehicleId, " Not Found!!!");
    if(vehicle.owner.$identifier !== agreementData.participantKey)
        throw new Error("해당 Vehicle은 " + agreementData.participantKey + "의 차량이 아닙니다.");

    const userRegistry = await getParticipantRegistry('com.autoever.ubi.participant.User')
        
    const user = await userRegistry.get(agreementData.participantKey);    
    if(!user) throw new Error("User : " + agreementData.participantKey, " Not Found!!!");
            
    var factory = getFactory();    
    var agreement = factory.newConcept('com.autoever.ubi.participant', 'Agreement');
    agreement.participantKey = agreementData.participantKey;
    agreement.vehicleId = agreementData.vehicleId;

    console.log('동의내역:');
    console.log(user.agreements);
    var agreements = user.agreements;
    if(agreements === undefined) {
        agreements = new Array();
    }
    agreements.push(agreement);
    user.agreements = agreements;

    await userRegistry.update(user);
    // throw new Error("updateDataProvidingAgreement 개발 예정");
}


/**
 * 차종 등록
 * @param {com.autoever.ubi.transaction.insertVehicleType} vehicleTypeData
 * @transaction
 * 
 */
async function insertVehicleType(vehicleTypeData) {

    const vehicleTypeRegistry = await getAssetRegistry('com.autoever.ubi.asset.VehicleType')
        
    var factory = getFactory();

    var newVehicleType = factory.newResource('com.autoever.ubi.asset', 'VehicleType', vehicleTypeData.vehicleType);
    
    newVehicleType.vehicleName = vehicleTypeData.vehicleName;
    newVehicleType.releasedDate = new Date(vehicleTypeData.releasedDate);


    // 4. Add to registry
    await vehicleTypeRegistry.add(newVehicleType);

    // throw new Error("insertVehicleType 개발 예정");
}


/**
 * 차량 등록
 * @param {com.autoever.ubi.transaction.insertVehicle} vehicleData
 * @transaction
 * 
 */
async function insertVehicle(vehicleData) {

    const vehicleTypeRegistry = await getAssetRegistry('com.autoever.ubi.asset.VehicleType');
    
    const vehicleType = await vehicleTypeRegistry.get(vehicleData.vehicleType);
    
    if(!vehicleType) throw new Error("VehicleType : " + vehicleData.vehicleType, " Not Found!!!");

    const userRegistry = await getParticipantRegistry('com.autoever.ubi.participant.User');
    const user = await userRegistry.get(vehicleData.owner);
    if(!user) throw new Error("User : " + vehicleData.owner, " Not Found!!!");

    const vehicleRegistry = await getAssetRegistry('com.autoever.ubi.asset.Vehicle');
    
    var factory = getFactory();
    
    var newVehicle = factory.newResource('com.autoever.ubi.asset', 'Vehicle', vehicleData.vehicleId);
    var vehicleTypeRelation = factory.newRelationship('com.autoever.ubi.asset', 'VehicleType', vehicleData.vehicleType);
    var ownerRelation = factory.newRelationship('com.autoever.ubi.participant', 'User', vehicleData.owner);
    
    newVehicle.vehicleType = vehicleTypeRelation;
    newVehicle.owner = ownerRelation;
    newVehicle.ownershipType = vehicleData.ownershipType;
    newVehicle.color = vehicleData.color;

    await vehicleRegistry.add(newVehicle);

    // throw new Error("insertVehicle 개발 예정");
}


function generateDate() {
    var now = new Date();

    var year = now.getFullYear() + '';
    // Date & Month needs to be in the format 01 02 
    // so add a '0' if they are single digits
    var month = now.getMonth()+1;
    if((month+'').length == 1)  month = '0'+month;

    var day = now.getDate();
    if((day+'').length == 1)  day = '0'+day;

    var hour = now.getHours();
    if((hour+'').length == 1)  hour = '0'+hour;

    var minute = now.getMinutes();
    if((minute+'').length == 1)  minute = '0'+minute;

    var second = now.getSeconds();
    if((second+'').length == 1)  second = '0'+second;

    var milliSecond = now.getMilliseconds();
    if((milliSecond+'').length == 1)  milliSecond = '0'+milliSecond;
    if((milliSecond+'').length == 2)  milliSecond = '0'+milliSecond;
    // console.log(dayNum,month,dt.getFullYear())

    return year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second + '.' + milliSecond + 'Z';
}