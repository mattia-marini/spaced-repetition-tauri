use std::{
    collections::{HashMap, HashSet},
    fs,
};

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::parse::{json::parse_json, markdown::parse_flashcards};

#[derive(Debug, Serialize)]
pub struct Flashcard {
    pub from_markdown: MarkdownInfos,
    pub from_json: JsonInfos,
}

#[derive(Debug, Serialize)]
pub struct MarkdownInfos {
    pub title: String,
    pub id: Option<usize>, // could be none if the card was just added and id tag is not set
    pub front: String,
    pub back: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct JsonInfos {
    pub creation_timestamp: DateTime<Utc>,
    pub last_review: Option<DateTime<Utc>>,
    pub scores: Vec<usize>,
}

/// This function does the following:
/// - Parses md file
/// - Parses json file
/// - Syncs json file to markdown file and viceversa:
///     - Assigns new id to md cards
///     - Removes dangling json ids
///     - Creating json entries for each md card that doesen't have it yet
pub fn parse_and_setup(
    markdown_path: &str,
    json_path: &str,
) -> Result<HashMap<usize, Flashcard>, String> {
    let mut parsed_markdown = match &mut fs::read_to_string(markdown_path) {
        Ok(file_content) => parse_flashcards(file_content),
        Err(e) => return Err("Cannot read markdown file".to_owned()),
    };

    let mut parsed_json = match &mut fs::read_to_string(json_path) {
        Ok(file_content) => match parse_json(file_content) {
            Ok(parsed_json) => parsed_json,
            Err(e) => return Err("Error in parsing json file".to_owned()),
        },
        Err(e) => return Err("Cannot read json file".to_owned()),
    };

    // Fetching ids defined in markdown
    let mut ids = HashSet::new();
    let mut new_cards = 0;
    for md_info in parsed_markdown.iter() {
        if let Some(id) = md_info.id {
            ids.insert(id);
        } else {
            new_cards += 1;
        }
    }

    // Clearing dangling json ids
    parsed_json = parsed_json
        .into_iter()
        .filter(|(id, _)| ids.contains(id))
        .collect();

    // Assigning new ids to new cards
    let mut new_ids = vec![];
    let mut candidate = 1;
    for _ in 0..new_cards {
        while ids.contains(&candidate) {
            candidate += 1;
        }
        new_ids.push(candidate);
        ids.insert(candidate);
    }

    let mut curr_new_id = 0;
    for md_info in parsed_markdown.iter_mut() {
        if md_info.id.is_none() {
            md_info.id = Some(new_ids[curr_new_id]);
            curr_new_id += 1;
        }
    }

    // Creating a new json entry for each card if it does not already exist
    for md_info in parsed_markdown.iter() {
        if !parsed_json.contains_key(&md_info.id.unwrap()) {
            parsed_json.insert(
                md_info.id.unwrap(),
                JsonInfos {
                    creation_timestamp: Utc::now(),
                    last_review: None,
                    scores: vec![],
                },
            );
        }
    }

    Ok(HashMap::from_iter(parsed_markdown.into_iter().map(
        |md_info| {
            (
                md_info.id.unwrap(),
                Flashcard {
                    from_json: parsed_json.remove_entry(&md_info.id.unwrap()).unwrap().1,
                    from_markdown: md_info,
                },
            )
        },
    )))
}
