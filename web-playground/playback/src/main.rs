use actix_cors::Cors;
use actix_web::middleware::Logger;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use aws_sdk_s3 as s3;
use aws_sdk_s3::presigning::PresigningConfig;
use s3::Client;
use serde::Deserialize;
use serde::Serialize;
use std::env;
use std::time::Duration;

#[derive(Deserialize)]
struct Info {
    name: String,
}

/**
 * SECTION - 쿼리들
 */
#[derive(Deserialize)]
struct S3쿼리 {
    key: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct S3멀티파트쿼리 {
    key: String,
    upload_id: String,
    part: i32,
} // !SECTION -  end 쿼리들

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct 어쩌구 {
    e_tag: String,
    part_number: i32,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct S3멀티파트업로드완료쿼리 {
    parts: Vec<어쩌구>,
    upload_id: String,
    key: String,
}

/**
 * SECTION - 응답들
 */

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct S3미리서명된주소응답 {
    presigned_url: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct S3업로드아이디응답 {
    upload_id: String,
    complete_url: String,
} // !SECTION - end 응답들

async fn s3클라이언트() -> Client {
    let config = aws_config::from_env().region("us-east-1").load().await;
    let client = Client::new(&config);
    return client;
}

#[get("/s3/미리서명된-주소")]
async fn 미리서명된_주소(query: web::Query<S3쿼리>) -> impl Responder {
    let s3 = s3클라이언트();
    let expire_in = Duration::from_secs(609);
    let req = s3
        .await
        .put_object()
        .bucket(env::var("AWS_BUCKET").unwrap())
        .key(query.key.clone())
        .presigned(PresigningConfig::expires_in(expire_in).unwrap())
        .await
        .unwrap();
    let response = S3미리서명된주소응답 {
        presigned_url: req.uri().to_string(),
    };
    return HttpResponse::Ok().json(response);
}

#[get("/s3")]
async fn 가져오기(query: web::Query<S3쿼리>) -> impl Responder {
    let s3 = s3클라이언트();
    let expire_in = Duration::from_secs(609);
    let req = s3
        .await
        .get_object()
        .bucket(env::var("AWS_BUCKET").unwrap())
        .key(query.key.clone())
        .presigned(PresigningConfig::expires_in(expire_in).unwrap())
        .await
        .unwrap();
    let response = S3미리서명된주소응답 {
        presigned_url: req.uri().to_string(),
    };
    return HttpResponse::Ok().json(response);
}

#[get("/s3/멀티파트/업로드-아이디")]
async fn 멀티파트_업로드_아이디(query: web::Query<S3쿼리>) -> impl Responder {
    println!("QUERY KEY ========={:?}", query.key.clone());

    let s3 = s3클라이언트();
    let req = s3
        .await
        .create_multipart_upload()
        // .acl(s3::types::ObjectCannedAcl::PublicReadWrite)
        .bucket(env::var("AWS_BUCKET").unwrap())
        .key(query.key.clone())
        .send()
        .await
        .unwrap();

    let response = S3업로드아이디응답 {
        upload_id: req.upload_id.as_ref().unwrap().to_string(),
        complete_url: format!(
            "https://{}.s3.us-east-1.amazonaws.com/{}?uploadId={}",
            env::var("AWS_BUCKET").unwrap(),
            query.key.clone(),
            req.upload_id.unwrap().to_string()
        ),
    };

    return HttpResponse::Ok().json(response);
}

#[get("/s3/멀티파트/미리서명된-주소")]
async fn 멀티파트_미리서명된_주소(
    query: web::Query<S3멀티파트쿼리>
) -> impl Responder {
    let s3 = s3클라이언트();
    let req = s3
        .await
        .upload_part()
        .bucket(env::var("AWS_BUCKET").unwrap())
        .key(query.key.clone())
        .upload_id(query.upload_id.clone())
        .part_number(query.part)
        .presigned(PresigningConfig::expires_in(Duration::from_secs(609)).unwrap())
        .await
        .unwrap();
    let response = S3미리서명된주소응답 {
        presigned_url: req.uri().to_string(),
    };
    println!("{:?}", req.headers());
    return HttpResponse::Ok().json(response);
}

#[post("/s3/멀티파트/업로드-완")]
async fn 멀티파트_업로드_완_제발(
    mut req_body: web::Json<S3멀티파트업로드완료쿼리>,
) -> impl Responder {
    let client = s3클라이언트();

    println!("멀티파트 업로드 완");
    println!("{:?}", req_body.key.clone());
    println!("{:?}", req_body.upload_id.clone());

    let mut parts: Vec<s3::types::CompletedPart> = Vec::new();

    for part in req_body.parts.iter() {
        let completed_part = s3::types::CompletedPart::builder()
            .e_tag(part.e_tag.clone())
            .part_number(part.part_number)
            .build();
        parts.push(completed_part);
    }

    let completed_multipart_upload: s3::types::CompletedMultipartUpload =
        s3::types::CompletedMultipartUpload::builder()
            .set_parts(Some(parts))
            .build();
    let req = client
        .await
        .complete_multipart_upload()
        .bucket(env::var("AWS_BUCKET").unwrap())
        .key(req_body.key.clone())
        .upload_id(req_body.upload_id.clone())
        .multipart_upload(completed_multipart_upload)
        .send()
        .await
        .unwrap();

    println!("{:?}", req.bucket);
    HttpResponse::Ok().body("LGTM")
}

#[post("/echo")]
async fn echo(req_body: String) -> impl Responder {
    HttpResponse::Ok().body(req_body)
}

#[get("/")]
async fn hello(name: web::Query<Info>) -> impl Responder {
    HttpResponse::Ok().body(format!("Hello {}!", name.name))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port = 3000;
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    HttpServer::new(move || {
        App::new()
            .wrap(Cors::permissive())
            .wrap(Logger::default())
            .service(hello)
            .service(echo)
            // generate parent route named s3
            .service(멀티파트_업로드_아이디)
            .service(미리서명된_주소)
            .service(멀티파트_미리서명된_주소)
            .service(멀티파트_업로드_완_제발)
            .service(가져오기)
    })
    .bind(("127.0.0.1", port))
    .expect(format!("Can not bind to port {}:", port.to_string()).as_str())
    .run()
    .await
}
