use std::str::FromStr;

use super::flashcard::MarkdownInfos;
use once_cell::sync::Lazy;
use regex::Regex;

pub enum MetadataTag<T> {
    Single(T),
    KeyValue(String, T),
}

pub enum MetadataParseError {
    ParseValueError(String),
    MalformedTag(String),
}

pub trait SimpleError {
    fn get_msg(&self) -> String;
}

impl SimpleError for MetadataParseError {
    fn get_msg(&self) -> String {
        match self {
            MetadataParseError::ParseValueError(msg) => msg.clone(),
            MetadataParseError::MalformedTag(msg) => msg.clone(),
        }
    }
}

static KEY_VALUE_METADATA_TAG_RE: Lazy<Regex> =
    Lazy::new(|| Regex::new(r"<!--\s*(\S+)\s*:\s*(\S+)\s*-->").unwrap());

static SINGLE_METADATA_TAG_RE: Lazy<Regex> =
    Lazy::new(|| Regex::new(r"<!--\s*(\S+)\s*-->").unwrap());

impl<T> FromStr for MetadataTag<T>
where
    T: FromStr,
{
    type Err = MetadataParseError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let key_value_metadata_tag = match KEY_VALUE_METADATA_TAG_RE.captures(s) {
            Some(caps) => match (caps.get(1), caps.get(2)) {
                (Some(key), Some(val)) => match T::from_str(val.as_str()) {
                    Ok(parsed_val) => Ok(MetadataTag::KeyValue(
                        String::from(key.as_str()),
                        parsed_val,
                    )),
                    Err(_e) => {
                        // println!("{:?} {:?}", key, val);
                        Err(Self::Err::MalformedTag(
                            "Could not parse tag's value".into(),
                        ))
                    }
                },
                (Some(_), None) => Err(Self::Err::MalformedTag("Missing val in tag".into())),
                (None, Some(_)) => Err(Self::Err::MalformedTag("Missing key in tag".into())),
                _ => Err(Self::Err::MalformedTag("The tag is malformed".into())),
            },
            None => Err(Self::Err::MalformedTag("The tag is malformed".into())),
        };

        // matched key value tag
        if let Ok(metadata_tag) = key_value_metadata_tag {
            return Ok(metadata_tag);
        }

        let single_metadata_tag = match SINGLE_METADATA_TAG_RE.captures(s) {
            Some(caps) => match caps.get(1) {
                Some(val) => match T::from_str(val.as_str()) {
                    Ok(parsed_val) => Ok(MetadataTag::Single(parsed_val)),
                    Err(_e) => Err(Self::Err::MalformedTag(
                        "Could not parse tag's value".into(),
                    )),
                },
                _ => Err(Self::Err::MalformedTag("Missing val in tag".into())),
            },
            None => Err(Self::Err::MalformedTag("The tag is malformed".into())),
        };

        single_metadata_tag
    }
}

pub fn parse_flashcards(file_content: &mut String) -> Vec<MarkdownInfos> {
    let mut file_content_iterator = file_content.lines().peekable();
    let mut cards = vec![];

    let title_regex = Regex::new(r"# (.*)").unwrap();

    loop {
        // Mardown header
        let mut title = None;
        while let Some(line) = file_content_iterator.next() {
            if let Some(caps) = title_regex.captures(line) {
                if let Some(title_match) = caps.get(1) {
                    title = Some(title_match.as_str().trim().to_string());
                    break;
                }
            }
        }

        // Metatags
        let mut id = None;
        while let Some(line) = file_content_iterator.peek() {
            match MetadataTag::<usize>::from_str(line) {
                Ok(metadata_tag) => match metadata_tag {
                    MetadataTag::KeyValue(key, value) => {
                        if key == "id" {
                            id = Some(value);
                        } else {
                            // Handle custom key-value tag
                        }
                    }
                    MetadataTag::Single(_) => {
                        // Handle custom single tag
                    }
                },
                Err(_) => {
                    break;
                }
            }
            file_content_iterator.next();
        }

        // Card front
        let mut front = String::with_capacity(1024);
        let mut has_back = false;
        while let Some(line) = file_content_iterator.next() {
            match MetadataTag::<String>::from_str(line) {
                Ok(metadata_tag) => match metadata_tag {
                    MetadataTag::KeyValue(key, value) => {}
                    MetadataTag::Single(val) => {
                        if val == "?" {
                            has_back = true;
                            break;
                        } else if val == "end" {
                            break;
                        }
                    }
                },
                Err(_) => {
                    front.push_str(line);
                }
            }
        }

        // Card back
        let mut back = if has_back {
            let mut back = String::with_capacity(1024);
            while let Some(line) = file_content_iterator.next() {
                match MetadataTag::<String>::from_str(line) {
                    Ok(metadata_tag) => match metadata_tag {
                        MetadataTag::KeyValue(key, value) => {}
                        MetadataTag::Single(val) => {
                            if val == "end" {
                                break;
                            }
                        }
                    },
                    Err(_) => {
                        back.push_str(line);
                    }
                }
            }
            Some(back)
        } else {
            None
        };

        match title {
            Some(title) => cards.push(MarkdownInfos {
                title,
                id,
                front,
                back,
            }),
            None => break,
        };
    }
    cards
}
